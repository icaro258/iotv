import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, Wifi, WifiOff, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TVCardProps {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline";
  lastSeen: string;
  model?: string;
  sensorData?: {
    current?: number;
    voltage?: number;
    power?: number;
    temperature?: number;
  };
  onRemove?: () => void;
  onStatusToggle?: (id: string, newStatus: "online" | "offline") => void;
}

export const TVCard = ({ 
  id, 
  name, 
  location, 
  status, 
  lastSeen, 
  model = "Smart TV",
  sensorData,
  onRemove,
  onStatusToggle
}: TVCardProps) => {
  const isOnline = status === "online";

  const handleStatusToggle = () => {
    if (onStatusToggle) {
      const newStatus = isOnline ? "offline" : "online";
      onStatusToggle(id, newStatus);
    }
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
      "bg-gradient-card border-border/50",
      isOnline 
        ? "shadow-lg shadow-online/20 hover:shadow-online/30" 
        : "shadow-lg shadow-red-500/20 hover:shadow-red-500/30"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-xl transition-colors",
              isOnline 
                ? "bg-success/20 text-success" 
                : "bg-red-500/20 text-red-400"
            )}>
              <Monitor className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">{name}</h3>
              <p className="text-sm text-muted-foreground">{location}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={isOnline ? "default" : "destructive"}
              className={cn(
                "gap-1.5 px-3 py-1 cursor-pointer transition-all duration-200",
                onStatusToggle && "hover:scale-105",
                isOnline 
                  ? "bg-success/20 text-success border-success/30 hover:bg-success/30" 
                  : "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
              )}
              onClick={onStatusToggle ? handleStatusToggle : undefined}
            >
              {isOnline ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              {status.toUpperCase()}
            </Badge>
            {onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              <div className={cn(
                "flex items-center gap-2",
                isOnline ? "text-success" : "text-red-400"
              )}>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isOnline 
                    ? "bg-success animate-pulse shadow-lg shadow-success/50" 
                    : "bg-red-500 shadow-lg shadow-red-500/50"
                )} />
                <span className="text-sm font-medium">
                  {isOnline ? "Ligada" : "Desligada"} 
                  {sensorData?.power && ` • ${sensorData.power.toFixed(1)}W`}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Modelo</span>
              <span className="text-sm font-medium text-foreground">{model}</span>
            </div>

            {sensorData && (sensorData.current || sensorData.voltage || sensorData.temperature) && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Sensores</span>
                <div className="text-sm font-medium text-foreground flex gap-2">
                  {sensorData.current && <span>{sensorData.current.toFixed(2)}A</span>}
                  {sensorData.voltage && <span>{sensorData.voltage.toFixed(0)}V</span>}
                  {sensorData.temperature && <span>{sensorData.temperature.toFixed(1)}°C</span>}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-border/50">
              <span className="text-sm text-muted-foreground">Última conexão</span>
              <span className="text-sm font-medium text-foreground">{lastSeen}</span>
            </div>
          </div>

        {/* Status indicator line */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 h-1",
          isOnline 
            ? "bg-gradient-to-r from-success to-emerald-400" 
            : "bg-gradient-to-r from-red-500 to-red-400"
        )} />
      </CardContent>
    </Card>
  );
};