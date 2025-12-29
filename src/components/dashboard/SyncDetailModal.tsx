import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useSync } from '@/lib/api/syncs';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { getSyncStatusBadge } from '@/lib/projectUtils';

interface SyncDetailModalProps {
  syncId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(1);
  return `${minutes}m ${seconds}s`;
}

function formatIntegration(integration: string): string {
  const mapping: Record<string, string> = {
    acc: 'ACC',
    drone_deploy: 'DroneDeploy',
    other: 'Other',
  };
  return mapping[integration] || integration;
}

export function SyncDetailModal({ syncId, open, onOpenChange }: SyncDetailModalProps) {
  const { data: sync, isLoading, error } = useSync(syncId, open);

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy h:mm a');
    } catch {
      return '—';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sync Details</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 text-red-400 text-sm">
            Failed to load sync details. Please try again.
          </div>
        )}

        {!isLoading && !error && sync && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Sync ID</label>
                <p className="mt-1 text-sm font-mono">{sync.id}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">{getSyncStatusBadge(sync.status)}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Project ID</label>
                <p className="mt-1 text-sm font-mono">{sync.project_id}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Integration</label>
                <p className="mt-1 text-sm">{formatIntegration(sync.integration)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Synced</label>
                <div className="mt-1">
                  {sync.synced ? (
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                      Yes
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-slate-500/20 text-slate-300 border-slate-500/50">
                      No
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Duration</label>
                <p className="mt-1 text-sm">{formatDuration(sync.duration_ms)}</p>
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">S3 File Key</label>
                <p className="mt-1 text-sm font-mono break-all">{sync.s3_file_key || '—'}</p>
              </div>

              {sync.acc_file_id && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">ACC File ID</label>
                  <p className="mt-1 text-sm font-mono break-all">{sync.acc_file_id}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p className="mt-1 text-sm">{formatDate(sync.created_at)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                <p className="mt-1 text-sm">{formatDate(sync.updated_at)}</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

