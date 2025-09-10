import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Device {
  id?: string
  name: string
  location: string
  status: 'online' | 'offline'
  model: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const url = new URL(req.url)
    const deviceId = url.pathname.split('/').pop()

    switch (req.method) {
      case 'GET':
        // Get all devices
        const { data: devices, error: fetchError } = await supabaseClient
          .from('devices')
          .select('*')
          .order('created_at', { ascending: false })

        if (fetchError) {
          console.error('Error fetching devices:', fetchError)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch devices' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        return new Response(
          JSON.stringify({ devices }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )

      case 'POST':
        // Add new device
        const deviceData: Device = await req.json()

        // Validate required fields
        if (!deviceData.name || !deviceData.location || !deviceData.model) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields: name, location, model' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        const { data: newDevice, error: insertError } = await supabaseClient
          .from('devices')
          .insert([{
            name: deviceData.name,
            location: deviceData.location,
            status: deviceData.status || 'offline',
            model: deviceData.model
          }])
          .select()
          .single()

        if (insertError) {
          console.error('Error inserting device:', insertError)
          return new Response(
            JSON.stringify({ error: 'Failed to create device' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        return new Response(
          JSON.stringify({ device: newDevice, message: 'Device created successfully' }),
          {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )

      case 'PUT':
        // Update device status
        if (!deviceId || deviceId === 'devices') {
          return new Response(
            JSON.stringify({ error: 'Device ID is required for updates' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        const updateData: Partial<Device> = await req.json()

        const { data: updatedDevice, error: updateError } = await supabaseClient
          .from('devices')
          .update(updateData)
          .eq('id', deviceId)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating device:', updateError)
          return new Response(
            JSON.stringify({ error: 'Failed to update device' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        return new Response(
          JSON.stringify({ device: updatedDevice, message: 'Device updated successfully' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )

      case 'DELETE':
        // Delete device
        if (!deviceId || deviceId === 'devices') {
          return new Response(
            JSON.stringify({ error: 'Device ID is required for deletion' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        const { error: deleteError } = await supabaseClient
          .from('devices')
          .delete()
          .eq('id', deviceId)

        if (deleteError) {
          console.error('Error deleting device:', deleteError)
          return new Response(
            JSON.stringify({ error: 'Failed to delete device' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        return new Response(
          JSON.stringify({ message: 'Device deleted successfully' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})