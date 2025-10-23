import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { pythonApi } from '@/services/pythonApi';

export interface Device {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  model: string;
  mac_address: string;
  mqtt_topic?: string;
  sensor_data?: {
    current?: number;
    voltage?: number;
    power?: number;
    temperature?: number;
  };
  last_heartbeat?: string;
  heartbeat_interval?: number;
  created_at?: string;
  updated_at?: string;
}

export const useDevices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('devices', {
        body: { action: 'list' },
      });

      if (error) {
        console.error('Error fetching devices:', error);
        toast({
          title: "Erro ao carregar dispositivos",
          description: "Não foi possível carregar a lista de dispositivos.",
          variant: "destructive",
        });
        return;
      }

      if (data?.devices) {
        setDevices(data.devices);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast({
        title: "Erro ao carregar dispositivos",
        description: "Não foi possível carregar a lista de dispositivos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addDevice = async (deviceData: Omit<Device, 'id'>) => {
    try {
      // Salvar no Supabase
      const { data, error } = await supabase.functions.invoke('devices', {
        body: { action: 'create', device: deviceData },
      });

      if (error) {
        console.error('Error adding device:', error);
        toast({
          title: "Erro ao adicionar dispositivo",
          description: "Não foi possível adicionar o dispositivo.",
          variant: "destructive",
        });
        return false;
      }

      if (data?.device) {
        // Também salvar na API Python/MySQL
        await pythonApi.createDevice({
          name: deviceData.name,
          location: deviceData.location,
          status: deviceData.status,
          model: deviceData.model,
          mac_address: deviceData.mac_address,
          mqtt_topic: deviceData.mqtt_topic,
        });

        setDevices(prev => [data.device, ...prev]);
        toast({
          title: "Dispositivo adicionado",
          description: `${deviceData.name} foi adicionado com sucesso.`,
        });
        return true;
      }
    } catch (error) {
      console.error('Error adding device:', error);
      toast({
        title: "Erro ao adicionar dispositivo",
        description: "Não foi possível adicionar o dispositivo.",
        variant: "destructive",
      });
      return false;
    }
    return false;
  };

  const updateDevice = async (deviceId: string, updates: Partial<Device>) => {
    try {
      // Atualizar no Supabase
      const { data, error } = await supabase.functions.invoke('devices', {
        body: { action: 'update', id: deviceId, updates },
      });

      if (error) {
        console.error('Error updating device:', error);
        toast({
          title: "Erro ao atualizar dispositivo",
          description: "Não foi possível atualizar o dispositivo.",
          variant: "destructive",
        });
        return false;
      }

      if (data?.device) {
        // Também atualizar na API Python/MySQL (especialmente status)
        if (updates.status) {
          await pythonApi.toggleDevicePower(deviceId, updates.status);
        } else {
          await pythonApi.updateDevice(deviceId, updates);
        }

        setDevices(prev => prev.map(device => 
          device.id === deviceId ? { ...device, ...data.device } : device
        ));
        toast({
          title: "Dispositivo atualizado",
          description: "O dispositivo foi atualizado com sucesso.",
        });
        return true;
      }
    } catch (error) {
      console.error('Error updating device:', error);
      toast({
        title: "Erro ao atualizar dispositivo",
        description: "Não foi possível atualizar o dispositivo.",
        variant: "destructive",
      });
      return false;
    }
    return false;
  };

  const removeDevice = async (deviceId: string) => {
    try {
      // Remover do Supabase
      const { error } = await supabase.functions.invoke('devices', {
        body: { action: 'delete', id: deviceId },
      });

      if (error) {
        console.error('Error removing device:', error);
        toast({
          title: "Erro ao remover dispositivo",
          description: "Não foi possível remover o dispositivo.",
          variant: "destructive",
        });
        return false;
      }

      // Também remover da API Python/MySQL
      await pythonApi.deleteDevice(deviceId);

      setDevices(prev => prev.filter(device => device.id !== deviceId));
      toast({
        title: "Dispositivo removido",
        description: "O dispositivo foi removido com sucesso.",
      });
      return true;
    } catch (error) {
      console.error('Error removing device:', error);
      toast({
        title: "Erro ao remover dispositivo",
        description: "Não foi possível remover o dispositivo.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchDevices();

    // Set up realtime subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'devices'
        },
        (payload) => {
          console.log('Device updated:', payload);
          fetchDevices(); // Refetch devices when there's a change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    devices,
    loading,
    addDevice,
    updateDevice,
    removeDevice,
    refetch: fetchDevices,
  };
};