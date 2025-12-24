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
import { LabeledSwitch } from '@/components/ui/labeled-switch';
import { MoreVertical, Search } from 'lucide-react';
import { useProjects, useUpdateProjectStatus, useDeleteProject, useUpdateProject } from '@/lib/api/projects';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { formatDate } from 'date-fns';
import { useNavigate } from 'react-router';
import { CreateProjectModal } from './CreateProjectModal';
import { getProjectStatusBadge } from '@/lib/projectUtils';
import type { Project } from '@/lib/api/projects';
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

interface ProjectsTableProps {
  title?: string;
  defaultPageSize?: number;
}

export function ProjectsTable({ defaultPageSize = 10 }: ProjectsTableProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('desc');
  const [autoSyncFilter, setAutoSyncFilter] = useState<boolean | undefined>(undefined);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Build query parameters
  const queryParams = useMemo(() => {
    const params: {
      query?: string;
      auto_sync?: boolean;
      page: number;
      size: number;
      order_by: SortOption;
    } = {
      page: currentPage,
      size: defaultPageSize,
      order_by: sortBy,
    };

    if (searchQuery.trim()) {
      params.query = searchQuery.trim();
    }

    if (autoSyncFilter !== undefined) {
      params.auto_sync = autoSyncFilter;
    }

    return params;
  }, [currentPage, searchQuery, autoSyncFilter, defaultPageSize, sortBy]);

  const { data, isLoading, error } = useProjects(queryParams);
  const updateStatusMutation = useUpdateProjectStatus();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleAutoSyncFilterChange = (value: string) => {
    if (value === 'all') {
      setAutoSyncFilter(undefined);
    } else if (value === 'true') {
      setAutoSyncFilter(true);
    } else {
      setAutoSyncFilter(false);
    }
    setCurrentPage(1);
  };

  const handleDeleteProject = () => {
    if (deleteProjectId !== null) {
      deleteProjectMutation.mutate(deleteProjectId, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setDeleteProjectId(null);
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
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by Project Name"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={autoSyncFilter === undefined ? 'all' : String(autoSyncFilter)} onValueChange={handleAutoSyncFilterChange}>
              <SelectTrigger className="w-[140px] bg-card rounded-lg border border-border">
                <SelectValue placeholder="Auto Sync" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Auto Sync On</SelectItem>
                <SelectItem value="false">Auto Sync Off</SelectItem>
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
          <div className="text-center py-8 text-muted-foreground">Loading projects...</div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 text-red-400 text-sm min-h-[350px] flex items-center justify-center">
            Failed to load projects. Please try again.
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className="rounded-2xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='min-w-[40px]'>ID</TableHead>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>File Count</TableHead>
                    <TableHead>Created at</TableHead>
                    <TableHead>Auto Sync</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No projects found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.data.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-mono text-sm min-w-[40px]">{project.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{project.name}</div>
                            {project.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-md">
                                {project.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getProjectStatusBadge(project.status)}</TableCell>
                        <TableCell>{project.file_count.toLocaleString()}</TableCell>
                        <TableCell>{formatDate(project.created_at, 'dd/MM/yyyy HH:mm')}</TableCell>
                         <TableCell>
                          {project.auto_sync === null ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <LabeledSwitch
                              checked={project.auto_sync}
                              onCheckedChange={(checked) => {
                                updateProjectMutation.mutate({
                                  projectId: project.id,
                                  data: {
                                    name: project.name,
                                    description: project.description || '',
                                    status: project.status,
                                    s3_bucket: project.s3_bucket,
                                    s3_prefix: project.s3_prefix,
                                    file_count: project.file_count,
                                    auto_sync: checked,
                                  },
                                });
                              }}
                              disabled={updateProjectMutation.isPending}
                            />
                          )}
                        </TableCell>
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
                                  navigate(`/projects/${project.id}`);
                                }}
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditProject(project);
                                  setIsEditModalOpen(true);
                                }}
                              >
                                Edit Project
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  updateStatusMutation.mutate({
                                    projectId: project.id,
                                    status: project.status === 'active' ? 'inactive' : 'active',
                                  });
                                }}
                                disabled={updateStatusMutation.isPending}
                              >
                                {project.status === 'active' ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuItem>Manage Integrations</DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500"
                                onClick={() => {
                                  setDeleteProjectId(project.id);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                Delete Project
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

      <CreateProjectModal
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) {
            setEditProject(null);
          }
        }}
        project={editProject}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteProjectMutation.isPending}
            >
              {deleteProjectMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
