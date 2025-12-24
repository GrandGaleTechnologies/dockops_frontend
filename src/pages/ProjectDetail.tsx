import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Header } from '@/components/dashboard/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Plus } from 'lucide-react';
import { useProject } from '@/lib/api/projects';
import { useProjectIntegrations, Integration } from '@/lib/api/integrations';
import { format } from 'date-fns';
import { getProjectStatusBadge } from '@/lib/projectUtils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreateIntegrationModal } from '@/components/dashboard/CreateIntegrationModal';
import { IntegrationDetailModal } from '@/components/dashboard/IntegrationDetailModal';

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isCreateIntegrationModalOpen, setIsCreateIntegrationModalOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: project, isLoading: isLoadingProject, error: projectError } = useProject(
    projectId!,
    !!projectId
  );
  const {
    data: integrations,
    isLoading: isLoadingIntegrations,
    error: integrationsError,
  } = useProjectIntegrations(projectId!, !!projectId);

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy h:mm a');
    } catch {
      return '—';
    }
  };

  if (isLoadingProject) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 text-red-400 text-sm">
            Failed to load project details. Please try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{project.name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Details Card */}
          <Card className="bg-card rounded-2xl border border-border">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Project ID</label>
                  <p className="mt-1 text-sm font-mono">{project.id}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getProjectStatusBadge(project.status)}</div>
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1 text-sm">{project.description || '—'}</p>
                </div>

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
                      <Badge
                        variant="outline"
                        className="bg-green-500/20 text-green-400 border-green-500/50"
                      >
                        On
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-slate-500/20 text-slate-300 border-slate-500/50"
                      >
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
            </CardContent>
          </Card>

          {/* Integrations Card */}
          <Card className="bg-card rounded-2xl border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Integrations</CardTitle>
                <Button
                  onClick={() => setIsCreateIntegrationModalOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Integration
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingIntegrations && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}

              {integrationsError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 text-red-400 text-sm">
                  Failed to load integrations. Please try again.
                </div>
              )}

              {!isLoadingIntegrations && !integrationsError && (
                <>
                  {integrations && integrations.length > 0 ? (
                    <div className="rounded-2xl border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {integrations.map((integration) => (
                            <TableRow
                              key={integration.id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => {
                                setSelectedIntegration(integration);
                                setIsDetailModalOpen(true);
                              }}
                            >
                              <TableCell className="font-mono text-sm">{integration.id}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{integration.integration_type}</Badge>
                              </TableCell>
                              <TableCell>
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
                              </TableCell>
                              <TableCell className="text-sm">
                                {formatDate(integration.created_at)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No integrations found for this project
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <CreateIntegrationModal
          open={isCreateIntegrationModalOpen}
          onOpenChange={setIsCreateIntegrationModalOpen}
          projectId={projectId!}
        />

        <IntegrationDetailModal
          integration={selectedIntegration}
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          projectId={projectId!}
        />
      </div>
    </div>
  );
};

export default ProjectDetail;

