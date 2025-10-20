import { useEffect } from "react";
import { TVCard } from "@/components/TVCard";
import { StatsCard } from "@/components/StatsCard";
import { Monitor, Tv, Wifi, Activity, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useDevices } from "@/hooks/useDevicesDemo";
import { AddDeviceDialog } from "@/components/AddDeviceDialog";

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

  const handleToggleAll = async () => {
    // Determina se deve ligar ou desligar baseado na maioria
    const shouldTurnOn = offlineDevices >= onlineDevices;
    const newStatus = shouldTurnOn ? "online" : "offline";
    
    // Atualiza todas as TVs
    for (const device of devices) {
      if (device.status !== newStatus) {
        await updateDevice(device.id, { status: newStatus });
      }
    }
    
    toast({
      title: shouldTurnOn ? "TVs ligadas" : "TVs desligadas",
      description: `Todas as TVs foram ${shouldTurnOn ? "ligadas" : "desligadas"} com sucesso.`,
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-primary">
              <Monitor className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              IoTV
            </h1>
          </div>
        </div>

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
                onClick={handleToggleAll}
                disabled={devices.length === 0}
                className={offlineDevices >= onlineDevices 
                  ? "bg-success hover:bg-success/90" 
                  : "bg-destructive hover:bg-destructive/90"}
              >
                {offlineDevices >= onlineDevices ? (
                  <>
                    <Power className="h-4 w-4 mr-2" />
                    Ligar Todas
                  </>
                ) : (
                  <>
                    <PowerOff className="h-4 w-4 mr-2" />
                    Desligar Todas
                  </>
                )}
              </Button>
              <AddDeviceDialog onAdd={addDevice} />
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                  <span>Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Offline</span>
                </div>
              </div>
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
                    name={device.name}
                    location={device.location}
                    status={device.status}
                    lastSeen={formatLastSeen(device.last_heartbeat || device.updated_at)}
                    model={device.model}
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
  );
};

export default Index;