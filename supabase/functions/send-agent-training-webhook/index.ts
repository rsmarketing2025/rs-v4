import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration constants
const WEBHOOK_TIMEOUT = 30000; // 30 seconds
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

// URL validation function
function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Retry function with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = MAX_RETRY_ATTEMPTS,
  baseDelay: number = RETRY_DELAY
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.log(`Attempt ${attempt} failed:`, lastError.message);
      
      if (attempt === maxAttempts) break;
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Connectivity test function
async function testConnectivity(url: string): Promise<boolean> {
  try {
    const testController = new AbortController();
    const testTimeout = setTimeout(() => testController.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: testController.signal,
    });
    
    clearTimeout(testTimeout);
    return response.status < 500; // Consider anything under 500 as "reachable"
  } catch (error) {
    console.log('Connectivity test failed:', error);
    return false;
  }
}

// This function is no longer needed as we only send IDs

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { payload, webhookUrl } = await req.json();

    if (!payload || !webhookUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing payload or webhookUrl' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate webhook URL format
    if (!isValidUrl(webhookUrl)) {
      console.error('Invalid webhook URL format:', webhookUrl);
      return new Response(
        JSON.stringify({ error: 'Invalid webhook URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Received payload:', JSON.stringify(payload, null, 2));
    console.log('Webhook URL:', webhookUrl);

    // Test connectivity to webhook URL
    console.log('Testing connectivity to webhook URL...');
    const isConnectable = await testConnectivity(webhookUrl);
    if (!isConnectable) {
      console.warn('Webhook URL appears unreachable, but proceeding anyway');
    }

    // Get authenticated user from the JWT token automatically handled by Supabase
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('User authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    // Get only IDs from agent_training_data for invisible_structure tab
    console.log('Fetching only IDs from agent_training_data for invisible_structure...');
    
    const { data: trainingDataIds } = await supabaseClient
      .from('agent_training_data')
      .select('id')
      .eq('user_id', user.id)
      .eq('tab_name', 'invisible_structure')
      .eq('status', 'active');

    console.log('📊 Training data IDs found:', trainingDataIds?.length || 0);

    // Create simple webhook payload with only IDs
    const webhookPayload = {
      user_id: user.id,
      timestamp: new Date().toISOString(),
      agent_training_data_ids: (trainingDataIds || []).map(item => item.id)
    };

    console.log('Webhook payload created:', JSON.stringify(webhookPayload, null, 2));

    // Use the webhook payload with only IDs 
    const payloadSize = JSON.stringify(webhookPayload).length;
    console.log(`Webhook payload size: ${payloadSize} bytes`);

    // Send webhook to external system with retry logic
    try {
      const webhookResult = await retryWithBackoff(async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT);

        try {
          console.log(`Sending webhook to: ${webhookUrl}`);
          
          const webhookResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Supabase-Edge-Function/1.0',
              'Accept': 'application/json',
              'X-Webhook-Source': 'agent-training-system',
              'X-Timestamp': new Date().toISOString(),
            },
            body: JSON.stringify(webhookPayload),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          console.log('Webhook response status:', webhookResponse.status);
          console.log('Webhook response headers:', Object.fromEntries(webhookResponse.headers.entries()));
          
          const webhookResponseText = await webhookResponse.text();
          console.log('Webhook response body:', webhookResponseText);

          // Validate response
          if (!webhookResponse.ok) {
            throw new Error(`HTTP ${webhookResponse.status}: ${webhookResponseText || 'No response body'}`);
          }

          // Try to parse JSON response for additional validation
          let responseData;
          try {
            responseData = webhookResponseText ? JSON.parse(webhookResponseText) : {};
          } catch (parseError) {
            console.warn('Response is not valid JSON, but request succeeded');
            responseData = { raw: webhookResponseText };
          }

          return {
            status: webhookResponse.status,
            data: responseData,
            headers: Object.fromEntries(webhookResponse.headers.entries())
          };

        } catch (fetchError) {
          clearTimeout(timeoutId);
          
          if (fetchError.name === 'AbortError') {
            throw new Error(`Webhook request timed out after ${WEBHOOK_TIMEOUT}ms`);
          }
          
          throw fetchError;
        }
      });

      console.log('Webhook sent successfully:', webhookResult);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Webhook sent successfully',
          webhook: {
            status: webhookResult.status,
            payloadSize: payloadSize,
            url: webhookUrl,
            ids_count: webhookPayload.agent_training_data_ids.length
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (webhookError) {
      console.error('Webhook error after all retries:', webhookError);
      
      // Try fallback webhook if available (could be implemented later)
      const fallbackError = await tryFallbackWebhook(webhookPayload, webhookUrl);
      
      // Webhook failed after all retries
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Webhook failed after all retries',
          details: webhookError.message,
          fallback: fallbackError ? `Fallback also failed: ${fallbackError}` : 'No fallback attempted',
          attempts: MAX_RETRY_ATTEMPTS,
          payloadSize: payloadSize,
          ids_count: webhookPayload.agent_training_data_ids.length
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Fallback webhook function (placeholder for future implementation)
async function tryFallbackWebhook(payload: any, originalUrl: string): Promise<string | null> {
  try {
    // For now, just log the failure - could implement email notification, 
    // database logging, or alternative webhook URLs here
    console.log('Fallback webhook mechanism triggered for URL:', originalUrl);
    console.log('Payload summary:', {
      user_id: payload.user_id,
      timestamp: payload.timestamp,
      ids_count: payload.agent_training_data_ids?.length || 0
    });
    
    // Could implement fallback logic here:
    // - Send to alternative webhook URL
    // - Store in database for manual retry
    // - Send notification email
    
    return null; // No fallback implemented yet
  } catch (error) {
    return error.message;
  }
}