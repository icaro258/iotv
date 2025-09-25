-- Add MQTT-related columns to devices table
ALTER TABLE public.devices 
ADD COLUMN mqtt_topic TEXT,
ADD COLUMN sensor_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN last_heartbeat TIMESTAMP WITH TIME ZONE,
ADD COLUMN heartbeat_interval INTEGER DEFAULT 60;

-- Create index for better performance on heartbeat queries
CREATE INDEX idx_devices_last_heartbeat ON public.devices(last_heartbeat);

-- Create index for MQTT topic lookups
CREATE INDEX idx_devices_mqtt_topic ON public.devices(mqtt_topic);

-- Enable Realtime for the devices table
ALTER TABLE public.devices REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.devices;