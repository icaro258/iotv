import { useState, useEffect } from "react";
import { TVCard } from "@/components/TVCard";
import { StatsCard } from "@/components/StatsCard";
import { Monitor, Tv, Wifi, Activity } from "lucide-react";

interface TV {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline";
  lastSeen: string;
  resolution: string;
  model: string;
}

const Index = () => {
  const [tvs, setTvs] = useState<TV[]>([
    {
      id: "1",
      name: "TV Sala Principal",
      location: "Sala de Estar",
      status: "online",
      lastSeen: "Agora",
      resolution: "4K (3840x2160)",
      model: "Samsung QLED 55\""
    },
    {
      id: "2",
      name: "TV Quarto Master",
      location: "Quarto Principal",
      status: "offline",
      lastSeen: "2 horas atrás",
      resolution: "Full HD (1920x1080)",
      model: "LG Smart TV 43\""
    },
    {
      id: "3",
      name: "TV Cozinha",
      location: "Área da Cozinha",
      status: "online",
      lastSeen: "Agora",
      resolution: "HD (1366x768)",
      model: "Philips 32\""
    },
    {
      id: "4",
      name: "TV Escritório",
      location: "Home Office",
      status: "online",
      lastSeen: "5 min atrás",
      resolution: "4K (3840x2160)",
      model: "Sony Bravia 49\""
    },
    {
      id: "5",
      name: "TV Quarto Hóspede",
      location: "Quarto de Visitas",
      status: "offline",
      lastSeen: "1 dia atrás",
      resolution: "Full HD (1920x1080)",
      model: "TCL Android TV 40\""
    },
    {
      id: "6",
      name: "TV Área Externa",
      location: "Varanda/Piscina",
      status: "online",
      lastSeen: "Agora",
      resolution: "4K (3840x2160)",
      model: "Samsung Outdoor 55\""
    }
  ]);

  const onlineTvs = tvs.filter(tv => tv.status === "online").length;
  const offlineTvs = tvs.filter(tv => tv.status === "offline").length;
  const totalTvs = tvs.length;
  const uptime = Math.round((onlineTvs / totalTvs) * 100);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTvs(prev => prev.map(tv => {
        // Randomly toggle status for demo purposes (10% chance)
        if (Math.random() < 0.1) {
          return {
            ...tv,
            status: tv.status === "online" ? "offline" : "online",
            lastSeen: tv.status === "offline" ? "Agora" : "Agora"
          };
        }
        return tv;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
              Monitor de TVs
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Acompanhe o status de todas as suas televisões em tempo real
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total de TVs"
            value={totalTvs}
            description="Dispositivos cadastrados"
            icon={Tv}
          />
          <StatsCard
            title="TVs Online"
            value={onlineTvs}
            description="Dispositivos ativos"
            icon={Wifi}
            className="border-success/30"
          />
          <StatsCard
            title="TVs Offline"
            value={offlineTvs}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tvs.map((tv) => (
              <TVCard
                key={tv.id}
                id={tv.id}
                name={tv.name}
                location={tv.location}
                status={tv.status}
                lastSeen={tv.lastSeen}
                resolution={tv.resolution}
                model={tv.model}
              />
            ))}
          </div>
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