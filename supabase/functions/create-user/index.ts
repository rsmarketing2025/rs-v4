
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create regular client for user operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Verify the requesting user is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header')
      throw new Error('Authorization header is required')
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('Received token (first 20 chars):', token.substring(0, 20))

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError) {
      console.error('Auth error:', authError)
      throw new Error(`Invalid authentication: ${authError.message}`)
    }

    if (!user) {
      console.error('No user found for token')
      throw new Error('Invalid authentication: User not found')
    }

    console.log('Authenticated user:', user.id)

    // Check if user is admin
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (roleError || !userRole) {
      console.error('Role check failed:', roleError)
      throw new Error('Admin access required')
    }

    console.log('Admin verified:', user.id)

    // Parse request body - Fixed parsing logic
    let formData;
    try {
      const bodyText = await req.text();
      console.log('Raw request body:', bodyText);
      
      if (!bodyText || bodyText.trim() === '') {
        throw new Error('Request body is empty');
      }
      
      const requestBody = JSON.parse(bodyText);
      console.log('Parsed request body:', requestBody);
      
      // Extract formData from the request
      formData = requestBody.formData || requestBody;
      
      if (!formData) {
        throw new Error('No formData found in request');
      }
      
      console.log('Form data extracted:', formData);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      throw new Error(`Invalid JSON in request body: ${parseError.message}`);
    }

    console.log('Creating user with data:', {
      email: formData.email,
      fullName: formData.fullName,
      role: formData.role
    })

    // Validate required fields
    if (!formData.email || !formData.password || !formData.fullName) {
      throw new Error('Email, password, and full name are required')
    }

    // Create user via Supabase Auth Admin API
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      user_metadata: {
        full_name: formData.fullName
      },
      email_confirm: true
    })

    if (createError) {
      console.error('Error creating user:', createError)
      console.error('Full error details:', JSON.stringify(createError, null, 2))
      
      // If it's a user already exists error, provide more specific message
      if (createError.message?.includes('already been registered') || createError.message?.includes('already exists')) {
        throw new Error(`Usuário com este email já existe`)
      }
      
      throw new Error(`Falha ao criar usuário: ${createError.message}`)
    }

    if (!userData.user) {
      throw new Error('User creation failed - no user returned')
    }

    console.log('User created successfully:', userData.user.id)

    // Wait a bit for trigger to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Update profile with additional information
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        username: formData.username || null,
        phone: formData.phone || null,
        is_active: formData.isActive ?? true
      })
      .eq('id', userData.user.id)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      console.warn('Profile update failed but user was created')
    }

    // Set user role (update the default 'user' role created by trigger)
    const { error: roleUpdateError } = await supabaseAdmin
      .from('user_roles')
      .update({ role: formData.role })
      .eq('user_id', userData.user.id)

    if (roleUpdateError) {
      console.error('Error updating role:', roleUpdateError)
      console.warn('Role update failed but user was created')
    }

    // Delete any existing permissions to avoid conflicts before inserting new ones
    await supabaseAdmin
      .from('user_page_permissions')
      .delete()
      .eq('user_id', userData.user.id);

    await supabaseAdmin
      .from('user_chart_permissions')
      .delete()
      .eq('user_id', userData.user.id);

    // Set page permissions - insert all pages with their respective access values
    const pagePermissions = Object.entries(formData.pagePermissions || {})
      .map(([page, canAccess]) => ({
        user_id: userData.user.id,
        page: page as 'creatives' | 'sales' | 'affiliates' | 'revenue' | 'users' | 'business-managers' | 'subscriptions' | 'kpis' | 'charts' | 'tables' | 'exports',
        can_access: Boolean(canAccess)
      }));

    if (pagePermissions.length > 0) {
      const { error: pagePermError } = await supabaseAdmin
        .from('user_page_permissions')
        .insert(pagePermissions);

      if (pagePermError) {
        console.error('Error setting page permissions:', pagePermError);
        console.warn('Page permissions update failed but user was created');
      }
    }

    // Set chart permissions - insert all charts with their respective access values  
    const chartPermissions = Object.entries(formData.chartPermissions || {})
      .map(([chart, canAccess]) => ({
        user_id: userData.user.id,
        chart_type: chart,
        can_access: Boolean(canAccess)
      }));

    if (chartPermissions.length > 0) {
      const { error: chartPermError } = await supabaseAdmin
        .from('user_chart_permissions')
        .insert(chartPermissions);

      if (chartPermError) {
        console.error('Error setting chart permissions:', chartPermError);
        console.warn('Chart permissions update failed but user was created');
      }
    }

    // Chart permissions removed - now controlled by page permissions

    console.log('User setup completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: userData.user,
        message: 'Usuário criado com sucesso!'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Function error:', error)
    
    let status = 400;
    let errorMessage = error.message || 'Erro interno do servidor';
    
    // Set appropriate status codes
    if (errorMessage.includes('Invalid authentication') || 
        errorMessage.includes('Authorization header is required') ||
        errorMessage.includes('User not found')) {
      status = 401;
    } else if (errorMessage.includes('Admin access required')) {
      status = 403;
    } else if (errorMessage.includes('User creation failed') ||
               errorMessage.includes('required')) {
      status = 400;
    } else {
      status = 500;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: status,
      },
    )
  }
})
