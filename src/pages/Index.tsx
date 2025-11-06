import { TVCard } from "@/components/TVCard";
import { StatsCard } from "@/components/StatsCard";
import Header from "@/components/Header";
import { Monitor, Tv, Wifi, Activity, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useDevices } from "@/hooks/useDevicesDemo";
import { AddDeviceDialog } from "@/components/AddDeviceDialog";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";

const Index = () => {
  const { devices, loading, addDevice, updateDevice, removeDevice } = useDevices();
  const { toast } = useToast();

  const onlineDevices = devices.filter(device => device.status === "online").length;
  const offlineDevices = devices.filter(device => device.status === "offline").length;
  const totalDevices = devices.length;
  const uptime = totalDevices > 0 ? Math.round((onlineDevices / totalDevices) * 100) : 0;


  // Format last seen based on updated_at
  const formatLastSeen = (updatedAt?: string) => {
    if (!updatedAt) return "Nunca";
    
    const now = new Date();
    const updated = new Date(updatedAt);
    const diffInMinutes = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Agora";
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} horas atrás`;
    return `${Math.floor(diffInMinutes / 1440)} dias atrás`;
  };

  const handleTurnOnAll = async () => {
    const offlineTVs = devices.filter(device => device.status === "offline");
    
    for (const device of offlineTVs) {
      await updateDevice(device.id, { status: "online" });
    }
    
    toast({
      title: "TVs ligadas",
      description: `Todas as TVs foram ligadas com sucesso.`,
    });
  };

  const handleTurnOffAll = async () => {
    const onlineTVs = devices.filter(device => device.status === "online");
    
    for (const device of onlineTVs) {
      await updateDevice(device.id, { status: "offline" });
    }
    
    toast({
      title: "TVs desligadas",
      description: `Todas as TVs foram desligadas com sucesso.`,
    });
  };

  const handleDownloadCSV = async () => {
    try {
      const now = new Date();
      const startDate = startOfMonth(now);
      const endDate = endOfMonth(now);

      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "Sem dados",
          description: "Não há dados para exportar no mês atual.",
          variant: "destructive"
        });
        return;
      }

      // Gerar CSV
      const headers = ['ID', 'Nome', 'Localização', 'Status', 'Modelo', 'MAC', 'Último Heartbeat', 'Criado em', 'Atualizado em'];
      const csvRows = [headers.join(',')];

      data.forEach(device => {
        const row = [
          device.id,
          device.name || '',
          device.location || '',
          device.status || '',
          device.model || '',
          device.mqtt_topic || '',
          device.last_heartbeat ? format(new Date(device.last_heartbeat), 'dd/MM/yyyy HH:mm:ss') : '',
          format(new Date(device.created_at), 'dd/MM/yyyy HH:mm:ss'),
          format(new Date(device.updated_at), 'dd/MM/yyyy HH:mm:ss')
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `devices_${format(now, 'MM-yyyy')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download completo",
        description: "Arquivo CSV baixado com sucesso.",
      });
    } catch (error) {
      console.error('Error downloading CSV:', error);
      toast({
        title: "Erro",
        description: "Falha ao gerar arquivo CSV.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total de TVs"
            value={totalDevices}
            description="Dispositivos cadastrados"
            icon={Tv}
          />
          <StatsCard
            title="TVs Online"
            value={onlineDevices}
            description="Dispositivos ativos"
            icon={Wifi}
            className="border-success/30"
          />
          <StatsCard
            title="TVs Offline"
            value={offlineDevices}
            description="Dispositivos inativos"
            icon={Monitor}
            className="border-red-500/30"
          />
          <StatsCard
            title="Uptime"
            value={`${uptime}%`}
            description="Taxa de disponibilidade"
            icon={Activity}
            className="border-primary/30"
            onClick={handleDownloadCSV}
          />
        </div>

        {/* TVs Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">
              Status das TVs
            </h2>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleTurnOnAll}
                disabled={offlineDevices === 0}
                className="bg-success hover:bg-success/90"
              >
                <Power className="h-4 w-4 mr-2" />
                Ligar TVs
              </Button>
              <Button
                onClick={handleTurnOffAll}
                disabled={onlineDevices === 0}
                className="bg-destructive hover:bg-destructive/90"
              >
                <PowerOff className="h-4 w-4 mr-2" />
                Desligar TVs
              </Button>
              <AddDeviceDialog onAdd={addDevice} />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando dispositivos...</p>
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum dispositivo cadastrado.</p>
              <AddDeviceDialog onAdd={addDevice} className="mt-4" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {devices.map((device) => (
                  <TVCard
                    key={device.id}
                    id={device.id}
                    nome={device.nome}
                    localizacao={device.localizacao}
                    status={device.status}
                    lastSeen={formatLastSeen(device.last_heartbeat || device.updated_at)}
                    modelo={device.modelo}
                    sensorData={device.sensor_data}
                    onRemove={() => removeDevice(device.id)}
                  />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Sistema de monitoramento atualizado em tempo real
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Index;