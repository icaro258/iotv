import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Device {
  id: string;
  nome: string;
  localizacao: string;
  status: 'online' | 'offline';
  modelo: string;
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

// Dados de exemplo para demonstração
const initialDevices: Device[] = [
  {
    id: '1',
    nome: 'TV 1',
    localizacao: 'Predio 1',
    status: 'online',
    modelo: 'Samsung',
    mqtt_topic: 'iotv/1/heartbeat',
    last_heartbeat: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    heartbeat_interval: 60,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    nome: 'TV 2',
    localizacao: 'Lab 1',
    status: 'online',
    modelo: 'LG',
    mqtt_topic: 'iotv/2/heartbeat',
    last_heartbeat: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    heartbeat_interval: 60,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    nome: 'TV Auditório',
    localizacao: 'Auditório Principal',
    status: 'offline',
    modelo: 'Sony',
    mqtt_topic: 'iotv/3/heartbeat',
    last_heartbeat: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    heartbeat_interval: 60,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    nome: 'TV 4',
    localizacao: 'Biblioteca',
    status: 'online',
    modelo: 'Philips',
    mqtt_topic: 'iotv/4/heartbeat',
    last_heartbeat: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    heartbeat_interval: 60,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    nome: 'TV 5',
    localizacao: 'predio 1 segundo andar',
    status: 'offline',
    modelo: 'Philco"',
    mqtt_topic: 'iotv/5/heartbeat',
    last_heartbeat: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    heartbeat_interval: 60,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
];

export const useDevices = () => {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDevices = async () => {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 300));
    setLoading(false);
  };

  const addDevice = async (deviceData: Omit<Device, 'id'>) => {
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 300));

      const newDevice: Device = {
        ...deviceData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_heartbeat: deviceData.status === 'online' ? new Date().toISOString() : undefined,
      };

      setDevices(prev => [newDevice, ...prev]);
      toast({
        title: "Dispositivo adicionado",
        description: `${deviceData.nome} foi adicionado com sucesso.`,
      });
      return true;
    } catch (error) {
      console.error('Error adding device:', error);
      toast({
        title: "Erro ao adicionar dispositivo",
        description: "Não foi possível adicionar o dispositivo.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateDevice = async (deviceId: string, updates: Partial<Device>) => {
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 300));

      setDevices(prev => prev.map(device => 
        device.id === deviceId 
          ? { 
              ...device, 
              ...updates, 
              updated_at: new Date().toISOString(),
              last_heartbeat: updates.status === 'online' ? new Date().toISOString() : device.last_heartbeat,
            } 
          : device
      ));
      toast({
        title: "Dispositivo atualizado",
        description: "O dispositivo foi atualizado com sucesso.",
      });
      return true;
    } catch (error) {
      console.error('Error updating device:', error);
      toast({
        title: "Erro ao atualizar dispositivo",
        description: "Não foi possível atualizar o dispositivo.",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeDevice = async (deviceId: string) => {
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 300));

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
