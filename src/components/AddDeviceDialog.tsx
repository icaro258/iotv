import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface AddDeviceDialogProps {
  onAdd: (device: { nome: string; localizacao: string; modelo: string; mac: string; status: 'online' | 'offline' }) => Promise<boolean> | boolean;
  className?: string;
}

export const AddDeviceDialog = ({ onAdd, className }: AddDeviceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [model, setModel] = useState("");
  const [macAddress, setMacAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await onAdd({ nome: name, localizacao: location, modelo: model, mac: macAddress, status: 'online' });
    setLoading(false);
    if (ok) {
      setOpen(false);
      setName("");
      setLocation("");
      setModel("");
      setMacAddress("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className}>Adicionar TV</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar nova TV</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Local</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Modelo</Label>
            <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="macAddress">Endereço MAC</Label>
            <Input 
              id="macAddress" 
              value={macAddress} 
              onChange={(e) => setMacAddress(e.target.value)} 
              placeholder="00:00:00:00:00:00"
              required 
            />
          </div>
          <p className="text-sm text-muted-foreground">
            A TV será adicionada como ligada
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};