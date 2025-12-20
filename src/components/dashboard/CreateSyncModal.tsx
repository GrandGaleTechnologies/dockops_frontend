import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateSync, CreateSyncData } from '@/lib/api/syncs';
import { useProjects } from '@/lib/api/projects';
import { getErrorMessage } from '@/lib/api/utils';
import { Loader2 } from 'lucide-react';

interface CreateSyncModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSyncModal({ open, onOpenChange }: CreateSyncModalProps) {
  const [formData, setFormData] = useState<CreateSyncData>({
    integration: 'acc',
    status: 'pending',
    synced: false,
    duration_ms: 0,
    project_id: 0,
    s3_file_key: '',
    acc_file_id: '',
  });
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateSync();
  const { data: projectsData } = useProjects({ page: 1, size: 100 }); // Fetch projects for dropdown

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        integration: 'acc',
        status: 'pending',
        synced: false,
        duration_ms: 0,
        project_id: 0,
        s3_file_key: '',
        acc_file_id: '',
      });
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.project_id) {
      setError('Please select a project');
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
      // Reset form and close modal on success
      setFormData({
        integration: 'acc',
        status: 'pending',
        synced: false,
        duration_ms: 0,
        project_id: 0,
        s3_file_key: '',
        acc_file_id: '',
      });
      onOpenChange(false);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleCancel = () => {
    setFormData({
      integration: 'acc',
      status: 'pending',
      synced: false,
      duration_ms: 0,
      project_id: 0,
      s3_file_key: '',
      acc_file_id: '',
    });
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Sync</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="project_id">
                Project <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.project_id ? String(formData.project_id) : ''}
                onValueChange={(value) =>
                  setFormData({ ...formData, project_id: parseInt(value) })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projectsData?.data.map((project) => (
                    <SelectItem key={project.id} value={String(project.id)}>
                      {project.name} (ID: {project.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="integration">
                Integration <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.integration}
                onValueChange={(value: 'acc' | 'drone_deploy' | 'other') =>
                  setFormData({ ...formData, integration: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select integration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acc">ACC</SelectItem>
                  <SelectItem value="drone_deploy">DroneDeploy</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'pending' | 'in_progress' | 'success' | 'failed') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="s3_file_key">
                S3 File Key <span className="text-destructive">*</span>
              </Label>
              <Input
                id="s3_file_key"
                value={formData.s3_file_key}
                onChange={(e) => setFormData({ ...formData, s3_file_key: e.target.value })}
                placeholder="Enter S3 file key"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="acc_file_id">
                ACC File ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="acc_file_id"
                value={formData.acc_file_id}
                onChange={(e) => setFormData({ ...formData, acc_file_id: e.target.value })}
                placeholder="Enter ACC file ID"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="duration_ms">Duration (ms)</Label>
              <Input
                id="duration_ms"
                type="number"
                value={formData.duration_ms}
                onChange={(e) =>
                  setFormData({ ...formData, duration_ms: parseInt(e.target.value) || 0 })
                }
                placeholder="Enter duration in milliseconds"
                className="mt-1"
                min={0}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="synced">Synced</Label>
                <p className="text-sm text-muted-foreground">
                  Mark this sync as synced
                </p>
              </div>
              <Switch
                id="synced"
                checked={formData.synced}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, synced: checked })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Sync'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

