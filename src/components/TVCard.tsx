import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface TVCardProps {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline";
  lastSeen: string;
  resolution?: string;
  model?: string;
}

export const TVCard = ({ 
  id, 
  name, 
  location, 
  status, 
  lastSeen, 
  resolution = "1920x1080",
  model = "Smart TV"
}: TVCardProps) => {
  const isOnline = status === "online";

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
          <Badge 
            variant={isOnline ? "default" : "destructive"}
            className={cn(
              "gap-1.5 px-3 py-1",
              isOnline 
                ? "bg-success/20 text-success border-success/30 hover:bg-success/30" 
                : "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
            )}
          >
            {isOnline ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            {status.toUpperCase()}
          </Badge>
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
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Resolução</span>
            <span className="text-sm font-medium text-foreground">{resolution}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Modelo</span>
            <span className="text-sm font-medium text-foreground">{model}</span>
          </div>

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