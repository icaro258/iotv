import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// MQTT configuration
const MQTT_BROKER_URL = Deno.env.get('MQTT_BROKER_URL')!;
const MQTT_USERNAME = Deno.env.get('MQTT_USERNAME')!;
const MQTT_PASSWORD = Deno.env.get('MQTT_PASSWORD')!;

interface HeartbeatMessage {
  device_id: string;
  status: 'online' | 'offline';
  sensor_data?: {
    current?: number;
    voltage?: number;
    power?: number;
    temperature?: number;
  };
  timestamp: string;
}

// Simple MQTT client implementation using WebSocket
class SimpleMQTTClient {
  private ws: WebSocket | null = null;
  private connected = false;

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Convert HTTP(S) URL to WebSocket URL for MQTT over WebSocket
        const wsUrl = MQTT_BROKER_URL.replace('mqtt://', 'ws://').replace('mqtts://', 'wss://');
        console.log('Connecting to MQTT broker:', wsUrl);
        
        this.ws = new WebSocket(wsUrl, ['mqtt']);
        
        this.ws.onopen = () => {
          console.log('MQTT WebSocket connected');
          this.connected = true;
          resolve();
        };
        
        this.ws.onerror = (error) => {
          console.error('MQTT connection error:', error);
          reject(error);
        };
        
        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };
        
        this.ws.onclose = () => {
          console.log('MQTT connection closed');
          this.connected = false;
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private async handleMessage(data: string) {
    try {
      console.log('MQTT message received:', data);
      
      // Parse the MQTT message
      const message: HeartbeatMessage = JSON.parse(data);
      
      if (!message.device_id) {
        console.error('Invalid message: missing device_id');
        return;
      }

      // Update device in database
      await this.updateDeviceStatus(message);
      
    } catch (error) {
      console.error('Error processing MQTT message:', error);
    }
  }

  private async updateDeviceStatus(message: HeartbeatMessage) {
    const { device_id, status, sensor_data, timestamp } = message;
    
    console.log(`Updating device ${device_id} status to ${status}`);
    
    const updateData: any = {
      status: status,
      last_heartbeat: timestamp || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (sensor_data) {
      updateData.sensor_data = sensor_data;
    }
    
    const { error } = await supabase
      .from('devices')
      .update(updateData)
      .eq('id', device_id);
    
    if (error) {
      console.error('Error updating device:', error);
    } else {
      console.log(`Device ${device_id} updated successfully`);
    }
  }

  subscribe(topic: string) {
    if (this.connected && this.ws) {
      console.log(`Subscribing to topic: ${topic}`);
      // Send MQTT subscribe command (simplified)
      this.ws.send(JSON.stringify({ cmd: 'subscribe', topic }));
    }
  }
}

// Background task to check for offline devices
async function checkOfflineDevices() {
  console.log('Checking for offline devices...');
  
  const now = new Date();
  const thresholdTime = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
  
  const { data: devices, error } = await supabase
    .from('devices')
    .select('id, name, last_heartbeat, heartbeat_interval, status')
    .eq('status', 'online');
  
  if (error) {
    console.error('Error fetching devices:', error);
    return;
  }
  
  for (const device of devices || []) {
    if (device.last_heartbeat) {
      const lastHeartbeat = new Date(device.last_heartbeat);
      const timeoutThreshold = new Date(now.getTime() - (device.heartbeat_interval || 60) * 2 * 1000);
      
      if (lastHeartbeat < timeoutThreshold) {
        console.log(`Device ${device.name} (${device.id}) is offline - last heartbeat: ${device.last_heartbeat}`);
        
        const { error: updateError } = await supabase
          .from('devices')
          .update({ 
            status: 'offline',
            updated_at: new Date().toISOString()
          })
          .eq('id', device.id);
        
        if (updateError) {
          console.error(`Error updating device ${device.id} to offline:`, updateError);
        }
      }
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'start-mqtt':
        console.log('Starting MQTT connection...');
        
        try {
          const mqttClient = new SimpleMQTTClient();
          await mqttClient.connect();
          
          // Subscribe to device heartbeat topics
          mqttClient.subscribe('iotv/+/heartbeat');
          mqttClient.subscribe('iotv/+/status');
          
          // Start periodic offline device check
          setInterval(checkOfflineDevices, 60000); // Check every minute
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'MQTT handler started successfully' 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('MQTT connection failed:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Failed to connect to MQTT broker',
            details: error instanceof Error ? error.message : 'Unknown error'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      case 'check-offline':
        await checkOfflineDevices();
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Offline device check completed' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'simulate-heartbeat':
        const { device_id, status = 'online', sensor_data } = await req.json();
        
        if (!device_id) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'device_id is required' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const updateData: any = {
          status: status,
          last_heartbeat: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (sensor_data) {
          updateData.sensor_data = sensor_data;
        }

        const { error } = await supabase
          .from('devices')
          .update(updateData)
          .eq('id', device_id);

        if (error) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Failed to update device',
            details: error.message 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Device heartbeat simulated successfully' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid action',
          available_actions: ['start-mqtt', 'check-offline', 'simulate-heartbeat']
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Error in MQTT handler:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});