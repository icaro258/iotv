import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Device {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  model: string;
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
        method: 'GET',
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
      const { data, error } = await supabase.functions.invoke('devices', {
        method: 'POST',
        body: deviceData,
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
      const { data, error } = await supabase.functions.invoke(`devices/${deviceId}`, {
        method: 'PUT',
        body: updates,
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
      const { error } = await supabase.functions.invoke(`devices/${deviceId}`, {
        method: 'DELETE',
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