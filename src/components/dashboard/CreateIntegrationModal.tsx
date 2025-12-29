import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateProjectIntegration, IntegrationType } from '@/lib/api/integrations';
import { getErrorMessage } from '@/lib/api/utils';
import { Loader2 } from 'lucide-react';

interface CreateIntegrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | number;
}

export function CreateIntegrationModal({
  open,
  onOpenChange,
  projectId,
}: CreateIntegrationModalProps) {
  const [integrationType, setIntegrationType] = useState<IntegrationType | ''>('');
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateProjectIntegration();

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setIntegrationType('');
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!integrationType) {
      setError('Please select an integration type');
      return;
    }

    try {
      await createMutation.mutateAsync({
        projectId,
        integrationType: integrationType as IntegrationType,
      });
      // Close modal on success
      setIntegrationType('');
      onOpenChange(false);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleCancel = () => {
    setIntegrationType('');
    setError(null);
    onOpenChange(false);
  };

  const isPending = createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Integration</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="integration_type">
                Integration Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={integrationType}
                onValueChange={(value) => setIntegrationType(value as IntegrationType)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select integration type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acc">ACC</SelectItem>
                  <SelectItem value="drone_deploy">Drone Deploy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !integrationType}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Integration'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

