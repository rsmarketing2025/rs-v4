import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('Received payload:', JSON.stringify(payload, null, 2));
    console.log('Webhook URL:', webhookUrl);

    // Get authenticated user
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
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save or update agent configuration with the consolidated payload
    const configData = {
      user_id: user.id,
      agent_name: payload.agent_name || 'Copy Chief',
      agent_description: payload.agent_description || '',
      default_language: payload.default_language || 'pt-BR',
      voice_tone: payload.voice_tone || 'formal',
      training_data_payload: payload.training_data || {}
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

    // Send webhook to external system (n8n)
    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Webhook response status:', webhookResponse.status);
      
      const webhookResponseText = await webhookResponse.text();
      console.log('Webhook response:', webhookResponseText);

      if (!webhookResponse.ok) {
        throw new Error(`Webhook failed with status ${webhookResponse.status}: ${webhookResponseText}`);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Configuration saved and webhook sent successfully',
          webhookStatus: webhookResponse.status
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (webhookError) {
      console.error('Webhook error:', webhookError);
      
      // Configuration was saved but webhook failed
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Configuration saved but webhook failed',
          details: webhookError.message
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