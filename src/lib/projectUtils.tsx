import { Badge } from '@/components/ui/badge';

export type ProjectStatus = 'active' | 'inactive' | 'pending';

export type SyncStatus = 'pending' | 'in_progress' | 'success' | 'failed';

/**
 * Get a status badge component for project status
 */
export function getProjectStatusBadge(status: ProjectStatus) {
  const colors: Record<ProjectStatus, string> = {
    active: 'bg-green-500/20 text-green-400 border-green-500/50',
    inactive: 'bg-slate-500/20 text-slate-300 border-slate-500/50',
    pending: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
  };

  const labels: Record<ProjectStatus, string> = {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
  };

  return (
    <Badge variant="outline" className={`${colors[status]} py-1.5 px-4 rounded-full`}>
      {labels[status]}
    </Badge>
  );
}

/**
 * Get a status badge component for sync status
 */
export function getSyncStatusBadge(status: SyncStatus) {
  const colors: Record<SyncStatus, string> = {
    pending: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
    in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    success: 'bg-green-500/20 text-green-400 border-green-500/50',
    failed: 'bg-red-500/20 text-red-400 border-red-500/50',
  };

  const labels: Record<SyncStatus, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    success: 'Success',
    failed: 'Failed',
  };

  return (
    <Badge variant="outline" className={`${colors[status]} py-1.5 px-4 rounded-full`}>
      {labels[status]}
    </Badge>
  );
}

