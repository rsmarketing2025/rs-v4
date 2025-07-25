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

// Optimize payload to reduce size
function optimizePayload(payload: any): any {
  const optimized = { ...payload };
  
  // Limit estrutura_invisivel to essential fields and max 50 items
  if (optimized.training_data?.estrutura_invisivel) {
    optimized.training_data.estrutura_invisivel = optimized.training_data.estrutura_invisivel
      .slice(0, 50)
      .map((item: any) => ({
        id: item.id,
        titulo: item.titulo,
        categoria: item.categoria,
        tipo_estrutura: item.tipo_estrutura,
        nicho: item.nicho,
        tom: item.tom,
        // Include content but truncate if too long
        conteudo: item.conteudo?.length > 1000 ? 
          item.conteudo.substring(0, 1000) + '...' : 
          item.conteudo
      }));
  }
  
  return optimized;
}

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

    // Enrich the payload with complete data from database
    console.log('Enriching payload with complete data...');
    
    // Get agent configuration
    const { data: agentConfig } = await supabaseClient
      .from('agent_configurations')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    // Get training files with complete details from invisible_structure tab
    const { data: filesData } = await supabaseClient
      .from('agent_training_data')
      .select('*')
      .eq('user_id', user.id)
      .eq('tab_name', 'invisible_structure')
      .eq('data_type', 'file')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Get reference links with complete details from invisible_structure tab
    const { data: linksData } = await supabaseClient
      .from('agent_training_data')
      .select('*')
      .eq('user_id', user.id)
      .eq('tab_name', 'invisible_structure')
      .eq('data_type', 'link')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Get manual contexts with complete details
    const { data: contextsData } = await supabaseClient
      .from('agent_training_data')
      .select('*')
      .eq('user_id', user.id)
      .eq('tab_name', 'invisible_structure')
      .eq('data_type', 'manual_prompt')
      .eq('status', 'active')
      .maybeSingle();

    // Get ONLY IDs from estrutura_invisivel table (this is what the webhook expects)
    const { data: estruturaInvisivelData } = await supabaseClient
      .from('estrutura_invisivel')
      .select('id')
      .eq('ativo', true)
      .order('created_at', { ascending: false });

    // Enrich files data with public URLs
    const enrichedFiles = (filesData || []).map(file => {
      let publicUrl = file.file_url;
      
      // If file_url doesn't exist or is a storage path, generate public URL
      if (!publicUrl || publicUrl.startsWith('agent-training-files/')) {
        const filePath = publicUrl || file.file_name;
        const { data: urlData } = supabaseClient.storage
          .from('agent-training-files')
          .getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
      }

      return {
        id: file.id,
        file_name: file.file_name,
        file_type: file.file_type,
        file_url: publicUrl,
        file_size: file.file_size,
        description: file.description,
        created_at: file.created_at
      };
    });

    // Enrich links data
    const enrichedLinks = (linksData || []).map(link => ({
      id: link.id,
      link_title: link.link_title || link.title,
      link_url: link.link_url,
      link_description: link.link_description || link.description,
      created_at: link.created_at
    }));

    // Enrich contexts data
    let enrichedContexts = [];
    if (contextsData && contextsData.manual_prompt) {
      enrichedContexts = [{
        id: contextsData.id,
        context_title: "Prompt Manual",
        context_content: contextsData.manual_prompt,
        tags: []
      }];
    }

    // Extract only IDs from estrutura_invisivel data
    const estruturaInvisivelIds = (estruturaInvisivelData || []).map(item => item.id);

    // Create payload with ONLY IDs for estrutura_invisivel (as requested)
    const webhookPayload = {
      ids: estruturaInvisivelIds
    };

    console.log('Webhook payload (IDs only):', JSON.stringify(webhookPayload, null, 2));
    console.log(`Found ${estruturaInvisivelIds.length} IDs from estrutura_invisivel table`);

    // Create enriched payload for saving configuration (full data)
    const enrichedPayload = {
      agent_id: agentConfig?.id || 'default',
      agent_name: agentConfig?.agent_name || payload.agent_name || 'Copy Chief',
      agent_description: agentConfig?.agent_description || payload.agent_description || '',
      default_language: agentConfig?.default_language || payload.default_language || 'pt-BR',
      voice_tone: agentConfig?.voice_tone || payload.voice_tone || 'formal',
      user_id: user.id,
      timestamp: new Date().toISOString(),
      training_data: {
        files: enrichedFiles,
        links: enrichedLinks,
        contexts: enrichedContexts,
        estrutura_invisivel_ids: estruturaInvisivelIds,
        total_files: enrichedFiles.length,
        total_links: enrichedLinks.length,
        total_contexts: enrichedContexts.length,
        total_estrutura_invisivel: estruturaInvisivelIds.length
      }
    };

    console.log('Enriched payload created for saving:', JSON.stringify(enrichedPayload, null, 2));

    // Save or update agent configuration with the consolidated payload
    const configData = {
      user_id: user.id,
      agent_name: enrichedPayload.agent_name,
      agent_description: enrichedPayload.agent_description,
      default_language: enrichedPayload.default_language,
      voice_tone: enrichedPayload.voice_tone,
      training_data_payload: enrichedPayload.training_data
    };

    // First, try to get existing configuration
    const { data: existingConfig } = await supabaseClient
      .from('agent_configurations')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    let saveResult;
    if (existingConfig) {
      // Update existing configuration
      saveResult = await supabaseClient
        .from('agent_configurations')
        .update(configData)
        .eq('user_id', user.id);
    } else {
      // Insert new configuration
      saveResult = await supabaseClient
        .from('agent_configurations')
        .insert(configData);
    }

    if (saveResult.error) {
      console.error('Error saving configuration:', saveResult.error);
      return new Response(
        JSON.stringify({ error: 'Failed to save configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Configuration saved successfully');

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
          message: 'Configuration saved and webhook sent successfully',
          webhook: {
            status: webhookResult.status,
            payloadSize: payloadSize,
            url: webhookUrl
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (webhookError) {
      console.error('Webhook error after all retries:', webhookError);
      
      // Try fallback webhook if available (could be implemented later)
      const fallbackError = await tryFallbackWebhook(webhookPayload, webhookUrl);
      
      // Configuration was saved but webhook failed
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Configuration saved but webhook failed after all retries',
          details: webhookError.message,
          fallback: fallbackError ? `Fallback also failed: ${fallbackError}` : 'No fallback attempted',
          attempts: MAX_RETRY_ATTEMPTS,
          payloadSize: payloadSize
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
      agent_name: payload.agent_name,
      user_id: payload.user_id,
      training_data_summary: {
        files: payload.training_data?.files?.length || 0,
        links: payload.training_data?.links?.length || 0,
        contexts: payload.training_data?.contexts?.length || 0,
        estrutura_invisivel: payload.training_data?.estrutura_invisivel?.length || 0
      }
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