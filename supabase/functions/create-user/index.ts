
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

    // Verify the requesting user is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header is required')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    // Check if user is admin
    const { data: userRole, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (roleError || !userRole) {
      throw new Error('Admin access required')
    }

    const { formData } = await req.json()
    
    console.log('Creating user with data:', {
      email: formData.email,
      fullName: formData.fullName,
      role: formData.role
    })

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
      throw createError
    }

    if (!userData.user) {
      throw new Error('User creation failed')
    }

    console.log('User created successfully:', userData.user.id)

    // Update profile with additional information
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        username: formData.username || null,
        phone: formData.phone || null
      })
      .eq('id', userData.user.id)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      throw profileError
    }

    // Set user role
    const { error: roleUpdateError } = await supabaseAdmin
      .from('user_roles')
      .update({ role: formData.role })
      .eq('user_id', userData.user.id)

    if (roleUpdateError) {
      console.error('Error updating role:', roleUpdateError)
      throw roleUpdateError
    }

    // Set page permissions
    const pagePermissions = Object.entries(formData.pagePermissions)
      .filter(([_, canAccess]) => canAccess)
      .map(([page, canAccess]) => ({
        user_id: userData.user.id,
        page: page as 'creatives' | 'sales' | 'affiliates' | 'revenue',
        can_access: canAccess
      }))

    if (pagePermissions.length > 0) {
      // Delete existing permissions first
      await supabaseAdmin
        .from('user_page_permissions')
        .delete()
        .eq('user_id', userData.user.id)

      const { error: pagePermError } = await supabaseAdmin
        .from('user_page_permissions')
        .insert(pagePermissions)

      if (pagePermError) {
        console.error('Error setting page permissions:', pagePermError)
        throw pagePermError
      }
    }

    // Set chart permissions
    const chartPermissions = formData.chartPermissions
      .filter((permission: any) => permission.canView)
      .map((permission: any) => ({
        user_id: userData.user.id,
        chart_type: permission.chartType as 'performance_overview' | 'time_series' | 'top_creatives' | 'metrics_comparison' | 'conversion_funnel' | 'roi_analysis' | 'sales_summary' | 'affiliate_performance' | 'revenue_breakdown',
        page: permission.page as 'creatives' | 'sales' | 'affiliates' | 'revenue',
        can_view: permission.canView
      }))

    if (chartPermissions.length > 0) {
      // Delete existing chart permissions first
      await supabaseAdmin
        .from('user_chart_permissions')
        .delete()
        .eq('user_id', userData.user.id)

      const { error: chartPermError } = await supabaseAdmin
        .from('user_chart_permissions')
        .insert(chartPermissions)

      if (chartPermError) {
        console.error('Error setting chart permissions:', chartPermError)
        throw chartPermError
      }
    }

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
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
