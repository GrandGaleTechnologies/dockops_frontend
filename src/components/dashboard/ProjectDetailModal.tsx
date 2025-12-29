import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useProject } from '@/lib/api/projects';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { getProjectStatusBadge } from '@/lib/projectUtils';

interface ProjectDetailModalProps {
  projectId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectDetailModal({ projectId, open, onOpenChange }: ProjectDetailModalProps) {
  const { data: project, isLoading, error } = useProject(projectId, open);

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
          <DialogTitle>Project Details</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 text-red-400 text-sm">
            Failed to load project details. Please try again.
          </div>
        )}

        {!isLoading && !error && project && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Project ID</label>
                <p className="mt-1 text-sm font-mono">{project.id}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">{getProjectStatusBadge(project.status)}</div>
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="mt-1 text-sm">{project.name}</p>
              </div>

              {project.description && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1 text-sm">{project.description}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">File Count</label>
                <p className="mt-1 text-sm">{project.file_count.toLocaleString()}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Auto Sync</label>
                <div className="mt-1">
                  {project.auto_sync === null ? (
                    <span className="text-sm text-muted-foreground">—</span>
                  ) : project.auto_sync ? (
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                      On
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-slate-500/20 text-slate-300 border-slate-500/50">
                      Off
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">S3 Bucket</label>
                <p className="mt-1 text-sm font-mono break-all">{project.s3_bucket}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">S3 Prefix</label>
                <p className="mt-1 text-sm font-mono break-all">{project.s3_prefix}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">User ID</label>
                <p className="mt-1 text-sm font-mono">{project.user_id}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p className="mt-1 text-sm">{formatDate(project.created_at)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                <p className="mt-1 text-sm">{formatDate(project.updated_at)}</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

