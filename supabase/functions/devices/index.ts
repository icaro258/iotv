import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type Status = 'online' | 'offline'

interface Device {
  id?: string
  name: string
  location: string
  status?: Status
  model: string
}

interface InvokeBody {
  action: 'list' | 'create' | 'update' | 'delete'
  id?: string
  device?: Device
  updates?: Partial<Device>
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = (await req.json().catch(() => ({}))) as Partial<InvokeBody>
    const action = body.action

    if (!action) {
      return new Response(JSON.stringify({ error: 'Missing action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'list') {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching devices:', error)
        return new Response(JSON.stringify({ error: 'Failed to fetch devices' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ devices: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'create') {
      const device = body.device as Device | undefined
      if (!device || !device.name || !device.location || !device.model) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: name, location, model' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      const { data, error } = await supabase
        .from('devices')
        .insert([
          {
            name: device.name,
            location: device.location,
            status: device.status ?? 'offline',
            model: device.model,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error('Error inserting device:', error)
        return new Response(JSON.stringify({ error: 'Failed to create device' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(
        JSON.stringify({ device: data, message: 'Device created successfully' }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    if (action === 'update') {
      const id = body.id
      const updates = (body.updates ?? {}) as Partial<Device>

      if (!id) {
        return new Response(JSON.stringify({ error: 'Missing device id' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data, error } = await supabase
        .from('devices')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle()

      if (error) {
        console.error('Error updating device:', error)
        return new Response(JSON.stringify({ error: 'Failed to update device' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ device: data, message: 'Device updated successfully' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'delete') {
      const id = body.id
      if (!id) {
        return new Response(JSON.stringify({ error: 'Missing device id' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error } = await supabase.from('devices').delete().eq('id', id)
      if (error) {
        console.error('Error deleting device:', error)
        return new Response(JSON.stringify({ error: 'Failed to delete device' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ message: 'Device deleted successfully' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('Unexpected error:', e)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
