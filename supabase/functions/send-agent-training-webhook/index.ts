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
  console.log('=== WEBHOOK FUNCTION STARTED ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Attempting to parse request body...');
    const requestBody = await req.text();
    console.log('Raw request body:', requestBody);
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(requestBody);
      console.log('Parsed request body:', parsedBody);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body', details: parseError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { agent_id, tab_name } = parsedBody;

    console.log('Validating required parameters...');
    console.log('agent_id:', agent_id, 'type:', typeof agent_id);
    console.log('tab_name:', tab_name, 'type:', typeof tab_name);
    
    if (!agent_id || !tab_name) {
      console.error('Missing required parameters:', { agent_id, tab_name });
      return new Response(
        JSON.stringify({ 
          error: 'Missing agent_id or tab_name',
          received: { agent_id, tab_name },
          validation: {
            agent_id_valid: !!agent_id,
            tab_name_valid: !!tab_name
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fixed webhook URL
    const webhookUrl = 'https://webhook-automatios-rsmtk.abbadigital.com.br/webhook/rag-rs-copy-estrutura-invisivel';

    console.log('=== WEBHOOK PREPARATION ===');
    console.log('Received agent_id:', agent_id);
    console.log('Received tab_name:', tab_name);
    console.log('Webhook URL:', webhookUrl);
    console.log('Webhook URL valid:', isValidUrl(webhookUrl));

    // Test connectivity to webhook URL
    console.log('=== CONNECTIVITY TEST ===');
    console.log('Testing connectivity to webhook URL...');
    const connectivityStart = Date.now();
    const isConnectable = await testConnectivity(webhookUrl);
    const connectivityDuration = Date.now() - connectivityStart;
    console.log(`Connectivity test completed in ${connectivityDuration}ms, result:`, isConnectable);
    
    if (!isConnectable) {
      console.warn('⚠️ Webhook URL appears unreachable, but proceeding anyway');
      console.warn('This might indicate network issues or the target server is down');
    } else {
      console.log('✅ Webhook URL is reachable');
    }

    // Create simple webhook payload with only agent_id and tab_name
    const webhookPayload = {
      agent_id,
      tab_name,
      timestamp: new Date().toISOString(),
      source: 'supabase-edge-function'
    };

    console.log('=== PAYLOAD CREATION ===');
    console.log('Webhook payload created:', JSON.stringify(webhookPayload, null, 2));

    const payloadSize = JSON.stringify(webhookPayload).length;
    console.log(`Webhook payload size: ${payloadSize} bytes`);
    
    if (payloadSize > 100000) { // 100KB limit
      console.warn('⚠️ Payload is quite large:', payloadSize, 'bytes');
    }

    // Send webhook to external system with retry logic
    console.log('=== WEBHOOK SENDING ===');
    const webhookStartTime = Date.now();
    
    try {
      const webhookResult = await retryWithBackoff(async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT);

        try {
          const requestStartTime = Date.now();
          console.log(`🚀 Sending webhook request to: ${webhookUrl}`);
          console.log('Request payload:', JSON.stringify(webhookPayload));
          
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
          const requestDuration = Date.now() - requestStartTime;

          console.log('=== WEBHOOK RESPONSE ===');
          console.log(`📥 Response received in ${requestDuration}ms`);
          console.log('Response status:', webhookResponse.status);
          console.log('Response status text:', webhookResponse.statusText);
          console.log('Response headers:', Object.fromEntries(webhookResponse.headers.entries()));
          
          const webhookResponseText = await webhookResponse.text();
          console.log('Response body length:', webhookResponseText.length);
          console.log('Response body:', webhookResponseText);

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

      const totalDuration = Date.now() - webhookStartTime;
      console.log('=== SUCCESS ===');
      console.log(`✅ Webhook sent successfully in ${totalDuration}ms:`, webhookResult);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Webhook sent successfully',
          duration: totalDuration,
          webhook: {
            status: webhookResult.status,
            payloadSize: payloadSize,
            url: webhookUrl,
            agent_id: webhookPayload.agent_id,
            tab_name: webhookPayload.tab_name,
            timestamp: webhookPayload.timestamp
          },
          response_data: webhookResult.data
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (webhookError) {
      const totalDuration = Date.now() - webhookStartTime;
      console.log('=== FAILURE ===');
      console.error(`❌ Webhook error after all retries (${totalDuration}ms):`, webhookError);
      console.error('Error name:', webhookError.name);
      console.error('Error message:', webhookError.message);
      console.error('Error stack:', webhookError.stack);
      
      // Try fallback webhook if available (could be implemented later)
      const fallbackError = await tryFallbackWebhook(webhookPayload, webhookUrl);
      
      // Webhook failed after all retries
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Webhook failed after all retries',
          details: webhookError.message,
          error_type: webhookError.name,
          duration: totalDuration,
          fallback: fallbackError ? `Fallback also failed: ${fallbackError}` : 'No fallback attempted',
          attempts: MAX_RETRY_ATTEMPTS,
          payloadSize: payloadSize,
          agent_id: webhookPayload.agent_id,
          tab_name: webhookPayload.tab_name,
          debug_info: {
            webhook_url: webhookUrl,
            connectivity_test: isConnectable,
            timestamp: new Date().toISOString()
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.log('=== CRITICAL ERROR ===');
    console.error('💥 Critical function error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        error_type: error.name,
        critical: true,
        timestamp: new Date().toISOString(),
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  console.log('=== WEBHOOK FUNCTION COMPLETED ===');
});

// Fallback webhook function (placeholder for future implementation)
async function tryFallbackWebhook(payload: any, originalUrl: string): Promise<string | null> {
  try {
    // For now, just log the failure - could implement email notification, 
    // database logging, or alternative webhook URLs here
    console.log('Fallback webhook mechanism triggered for URL:', originalUrl);
    console.log('Payload summary:', {
      agent_id: payload.agent_id,
      tab_name: payload.tab_name
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