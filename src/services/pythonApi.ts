// Python API Service - Comunicação com API Python/MySQL
const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:5000';

export interface PythonDevice {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  model: string;
  mac_address: string;
  mqtt_topic?: string;
}

class PythonApiService {
  private baseUrl: string;

  constructor(baseUrl: string = PYTHON_API_URL) {
    this.baseUrl = baseUrl;
  }

  // Ligar/Desligar dispositivo
  async toggleDevicePower(deviceId: string, status: 'online' | 'offline'): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/devices/${deviceId}/power`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success || true;
    } catch (error) {
      console.error('[Python API] Erro ao alternar status:', error);
      return false;
    }
  }

  // Criar dispositivo
  async createDevice(device: Omit<PythonDevice, 'id'>): Promise<PythonDevice | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/devices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(device),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[Python API] Erro ao criar dispositivo:', error);
      return null;
    }
  }

  // Atualizar dispositivo
  async updateDevice(deviceId: string, updates: Partial<PythonDevice>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/devices/${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('[Python API] Erro ao atualizar dispositivo:', error);
      return false;
    }
  }

  // Deletar dispositivo
  async deleteDevice(deviceId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/devices/${deviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('[Python API] Erro ao deletar dispositivo:', error);
      return false;
    }
  }

  // Listar dispositivos
  async listDevices(): Promise<PythonDevice[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/devices`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[Python API] Erro ao listar dispositivos:', error);
      return [];
    }
  }
}

export const pythonApi = new PythonApiService();
