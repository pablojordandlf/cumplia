'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { RiaFormTemplate } from '@/types/ria-form-template';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: RiaFormTemplate[];
  onConfirm: (name: string, description: string, sourceId: string) => Promise<void>;
}

export function CreateRiaTemplateDialog({ open, onOpenChange, templates, onConfirm }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const systemTemplate = templates.find((t) => t.is_system);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const resolvedSource = sourceId || systemTemplate?.id || '';
    if (!resolvedSource) return;

    setIsLoading(true);
    try {
      await onConfirm(name.trim(), description.trim(), resolvedSource);
      setName('');
      setDescription('');
      setSourceId('');
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva plantilla RIA</DialogTitle>
          <DialogDescription>
            Crea una plantilla personalizada basándote en una existente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="ria-name">Nombre *</Label>
            <Input
              id="ria-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Plantilla sector sanitario"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ria-description">Descripción</Label>
            <Textarea
              id="ria-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional de la plantilla..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ria-source">Basada en</Label>
            <Select value={sourceId || systemTemplate?.id || ''} onValueChange={setSourceId} disabled={isLoading}>
              <SelectTrigger id="ria-source">
                <SelectValue placeholder="Selecciona plantilla base..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                    {t.is_system ? ' (sistema)' : ''}
                    {t.is_default && !t.is_system ? ' (predeterminada)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !name.trim()}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Crear plantilla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
