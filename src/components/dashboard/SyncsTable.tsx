import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Search } from 'lucide-react';
import { useSyncs, useTriggerManualSync, useDeleteSync, SyncsQueryParams } from '@/lib/api/syncs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import { getSyncStatusBadge } from '@/lib/projectUtils';
import { SyncDetailModal } from './SyncDetailModal';
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

type SortOption = 'desc' | 'asc';
type StatusFilter = 'pending' | 'in_progress' | 'success' | 'failed' | 'all';
type IntegrationFilter = 'acc' | 'drone_deploy' | 'other' | 'all';
type SyncedFilter = 'all' | 'synced' | 'not_synced';

interface SyncsTableProps {
  title?: string;
  defaultPageSize?: number;
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

export function SyncsTable({ defaultPageSize = 10 }: SyncsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('desc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [integrationFilter, setIntegrationFilter] = useState<IntegrationFilter>('all');
  const [syncedFilter, setSyncedFilter] = useState<SyncedFilter>('all');
  const [selectedSyncId, setSelectedSyncId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteSyncId, setDeleteSyncId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Build query parameters
  const queryParams = useMemo((): SyncsQueryParams => {
    const params: SyncsQueryParams = {
      page: currentPage,
      size: defaultPageSize,
      order_by: sortBy,
    };

    if (searchQuery.trim()) {
      params.q = searchQuery.trim();
    }

    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }

    if (integrationFilter !== 'all') {
      params.integration = integrationFilter;
    }

    if (syncedFilter === 'synced') {
      params.synced = true;
    } else if (syncedFilter === 'not_synced') {
      params.synced = false;
    }

    return params;
  }, [currentPage, searchQuery, statusFilter, integrationFilter, syncedFilter, defaultPageSize, sortBy]);

  const { data, isLoading, error } = useSyncs(queryParams);
  const triggerManualSyncMutation = useTriggerManualSync();
  const deleteSyncMutation = useDeleteSync();

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as StatusFilter);
    setCurrentPage(1);
  };

  const handleIntegrationFilterChange = (value: string) => {
    setIntegrationFilter(value as IntegrationFilter);
    setCurrentPage(1);
  };

  const handleSyncedFilterChange = (value: string) => {
    setSyncedFilter(value as SyncedFilter);
    setCurrentPage(1);
  };

  const handleDeleteSync = () => {
    if (deleteSyncId !== null) {
      deleteSyncMutation.mutate(deleteSyncId, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setDeleteSyncId(null);
        },
      });
    }
  };

  const totalPages = data?.meta.total_no_pages || 1;
  const hasNextPage = data?.meta.has_next_page || false;
  const hasPrevPage = data?.meta.has_prev_page || false;

  return (
    <Card className="bg-card rounded-2xl border border-border">
      <CardHeader>
        {/* <CardTitle>{title}</CardTitle> */}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search syncs"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-[140px] bg-card rounded-lg border border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={integrationFilter} onValueChange={handleIntegrationFilterChange}>
              <SelectTrigger className="w-[140px] bg-card rounded-lg border border-border">
                <SelectValue placeholder="Integration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Integrations</SelectItem>
                <SelectItem value="acc">ACC</SelectItem>
                <SelectItem value="drone_deploy">DroneDeploy</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={syncedFilter} onValueChange={handleSyncedFilterChange}>
              <SelectTrigger className="w-[140px] bg-card rounded-lg border border-border">
                <SelectValue placeholder="Synced" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="synced">Synced</SelectItem>
                <SelectItem value="not_synced">Not Synced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[140px] bg-card rounded-lg border border-border">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-8 text-muted-foreground">Loading syncs...</div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 text-red-400 text-sm min-h-[350px] flex items-center justify-center">
            Failed to load syncs. Please try again.
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className="rounded-2xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Project ID</TableHead>
                    <TableHead>Integration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Synced</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>S3 File Key</TableHead>
                    <TableHead>Created at</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No syncs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.data.map((sync) => (
                      <TableRow key={sync.id}>
                        <TableCell className="font-mono text-sm">{sync.id}</TableCell>
                        <TableCell className="font-mono text-sm">{sync.project_id}</TableCell>
                        <TableCell>{formatIntegration(sync.integration)}</TableCell>
                        <TableCell>{getSyncStatusBadge(sync.status)}</TableCell>
                        <TableCell>
                          {sync.synced ? (
                            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                              Yes
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-slate-500/20 text-slate-300 border-slate-500/50">
                              No
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDuration(sync.duration_ms)}</TableCell>
                        <TableCell className="font-mono text-xs max-w-xs truncate" title={sync.s3_file_key}>
                          {sync.s3_file_key || '—'}
                        </TableCell>
                        <TableCell>{format(new Date(sync.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild className='hover:border-primary hover:border'>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSyncId(sync.id);
                                  setIsModalOpen(true);
                                }}
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  triggerManualSyncMutation.mutate(sync.id);
                                }}
                                disabled={triggerManualSyncMutation.isPending}
                              >
                                {triggerManualSyncMutation.isPending ? 'Triggering...' : 'Trigger Manual Sync'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500"
                                onClick={() => {
                                  setDeleteSyncId(sync.id);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (hasPrevPage) setCurrentPage(currentPage - 1);
                      }}
                      className={!hasPrevPage ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => {
                    const page = i + 1;
                    if (totalPages > 10) {
                      if (page === 1 || page === totalPages) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page);
                              }}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      if (page === currentPage || page === currentPage - 1 || page === currentPage + 1) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page);
                              }}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      if (page === 2 || page === totalPages - 1) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    }
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (hasNextPage) setCurrentPage(currentPage + 1);
                      }}
                      className={!hasNextPage ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}
      </CardContent>

      <SyncDetailModal
        syncId={selectedSyncId}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sync</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this sync? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSync}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteSyncMutation.isPending}
            >
              {deleteSyncMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

