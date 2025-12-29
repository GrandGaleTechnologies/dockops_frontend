import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Integration, useDeleteIntegration } from '@/lib/api/integrations';
import { format } from 'date-fns';
import { Loader2, Trash2 } from 'lucide-react';
import { getErrorMessage } from '@/lib/api/utils';

interface IntegrationDetailModalProps {
  integration: Integration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | number;
}

export function IntegrationDetailModal({
  integration,
  open,
  onOpenChange,
  projectId,
}: IntegrationDetailModalProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteMutation = useDeleteIntegration();

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy h:mm a');
    } catch {
      return '—';
    }
  };

  const formatConfigKey = (key: string): string => {
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleDelete = () => {
    if (integration) {
      deleteMutation.mutate(
        {
          integrationId: integration.id,
          projectId,
        },
        {
          onSuccess: () => {
            setIsDeleteDialogOpen(false);
            onOpenChange(false);
          },
          onError: (error) => {
            console.error('Delete failed:', getErrorMessage(error));
          },
        }
      );
    }
  };

  if (!integration) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Integration Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Integration ID</label>
              <p className="mt-1 text-sm font-mono">{integration.id}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Project ID</label>
              <p className="mt-1 text-sm font-mono">{integration.project_id}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Integration Type</label>
              <div className="mt-1">
                <Badge variant="outline">{integration.integration_type}</Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                {integration.enabled ? (
                  <Badge
                    variant="outline"
                    className="bg-green-500/20 text-green-400 border-green-500/50"
                  >
                    Enabled
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-slate-500/20 text-slate-300 border-slate-500/50"
                  >
                    Disabled
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Created At</label>
              <p className="mt-1 text-sm">{formatDate(integration.created_at)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Updated At</label>
              <p className="mt-1 text-sm">{formatDate(integration.updated_at)}</p>
            </div>
          </div>

          {/* Config Section */}
          {integration.config && Object.keys(integration.config).length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Configuration</h3>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(integration.config).map(([key, value]) => {
                  if (value === null || value === undefined || value === '') return null;
                  
                  return (
                    <div key={key}>
                      <label className="text-sm font-medium text-muted-foreground">
                        {formatConfigKey(key)}
                      </label>
                      <p className="mt-1 text-sm font-mono break-all bg-muted/50 p-2 rounded-xl">
                        {String(value)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Delete Button */}
          <div className="border-t pt-6">
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="w-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Integration
            </Button>
          </div>
        </div>
      </DialogContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Integration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this integration? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}

