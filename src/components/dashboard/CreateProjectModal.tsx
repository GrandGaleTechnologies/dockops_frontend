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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCreateProject,
  useUpdateProject,
  CreateProjectData,
  UpdateProjectData,
  Project,
} from '@/lib/api/projects';
import { getErrorMessage } from '@/lib/api/utils';
import { Loader2 } from 'lucide-react';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
}

export function CreateProjectModal({ open, onOpenChange, project }: CreateProjectModalProps) {
  const isEditMode = !!project;

  const getInitialFormData = (proj?: Project | null): CreateProjectData | UpdateProjectData => {
    if (proj) {
      return {
        name: proj.name,
        description: proj.description || '',
        auto_sync: proj.auto_sync ?? false,
        s3_bucket: proj.s3_bucket,
        s3_prefix: proj.s3_prefix,
        status: proj.status,
        file_count: proj.file_count,
      };
    }
    return {
      name: '',
      description: '',
      auto_sync: false,
      s3_bucket: '',
      s3_prefix: '',
    };
  };

  const [formData, setFormData] = useState<CreateProjectData | UpdateProjectData>(() =>
    getInitialFormData(project)
  );
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  // Reset form when modal opens or project changes
  useEffect(() => {
    if (open) {
      const initialData = getInitialFormData(project);
      setFormData(initialData);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, project?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isEditMode && project) {
        await updateMutation.mutateAsync({
          projectId: project.id,
          data: formData as UpdateProjectData,
        });
      } else {
        await createMutation.mutateAsync(formData as CreateProjectData);
      }
      // Reset form and close modal on success
      setFormData({
        name: '',
        description: '',
        auto_sync: false,
        s3_bucket: '',
        s3_prefix: '',
        ...(isEditMode && {
          status: 'active' as const,
          file_count: 0,
        }),
      });
      onOpenChange(false);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      auto_sync: false,
      s3_bucket: '',
      s3_prefix: '',
      ...(isEditMode && {
        status: 'active' as const,
        file_count: 0,
      }),
    });
    setError(null);
    onOpenChange(false);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Project' : 'Create New Project'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">
                Project Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter project name"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter project description (optional)"
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="s3_bucket">
                S3 Bucket <span className="text-destructive">*</span>
              </Label>
              <Input
                id="s3_bucket"
                value={formData.s3_bucket}
                onChange={(e) => setFormData({ ...formData, s3_bucket: e.target.value })}
                placeholder="Enter S3 bucket name"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="s3_prefix">
                S3 Prefix <span className="text-destructive">*</span>
              </Label>
              <Input
                id="s3_prefix"
                value={formData.s3_prefix}
                onChange={(e) => setFormData({ ...formData, s3_prefix: e.target.value })}
                placeholder="Enter S3 prefix"
                required
                className="mt-1"
              />
            </div>

            {isEditMode && (
              <>
                <div>
                  <Label htmlFor="status">
                    Status <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={(formData as UpdateProjectData).status}
                    onValueChange={(value: 'active' | 'inactive' | 'pending') =>
                      setFormData({ ...formData, status: value } as UpdateProjectData)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="file_count">File Count</Label>
                  <Input
                    id="file_count"
                    type="number"
                    value={(formData as UpdateProjectData).file_count}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        file_count: parseInt(e.target.value) || 0,
                      } as UpdateProjectData)
                    }
                    className="mt-1"
                    required
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto_sync">Auto Sync</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically sync files for this project
                </p>
              </div>
              <Switch
                id="auto_sync"
                checked={formData.auto_sync}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, auto_sync: checked })
                }
              />
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
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : isEditMode ? (
                'Update Project'
              ) : (
                'Create Project'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

