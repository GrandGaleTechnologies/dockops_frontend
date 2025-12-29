import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Plus } from 'lucide-react';
import { useProjectIntegrations, Integration } from '@/lib/api/integrations';
import { format } from 'date-fns';
import { CreateIntegrationModal } from './CreateIntegrationModal';
import { IntegrationDetailModal } from './IntegrationDetailModal';

interface ManageIntegrationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | number;
  projectName?: string;
}

export function ManageIntegrationsModal({
  open,
  onOpenChange,
  projectId,
  projectName,
}: ManageIntegrationsModalProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const {
    data: integrations,
    isLoading,
    error,
  } = useProjectIntegrations(projectId, open);

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy h:mm a');
    } catch {
      return '—';
    }
  };

  const handleIntegrationClick = (integration: Integration) => {
    setSelectedIntegration(integration);
    setIsDetailModalOpen(true);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl min-w-3xl max-h-[60vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between mt-4">
              <DialogTitle>
                Manage Integrations
                {projectName && (
                  <span className="text-muted-foreground font-normal ml-2">
                    - {projectName}
                  </span>
                )}
              </DialogTitle>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-primary hover:bg-primary/90"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Integration
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 text-red-400 text-sm">
                Failed to load integrations. Please try again.
              </div>
            )}

            {!isLoading && !error && (
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
                            onClick={() => handleIntegrationClick(integration)}
                          >
                            <TableCell className="font-mono text-sm">
                              {integration.id}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {integration.integration_type}
                              </Badge>
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
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="mb-4">No integrations found for this project</p>
                    <Button
                      onClick={() => setIsCreateModalOpen(true)}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Integration
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CreateIntegrationModal
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) {
            handleCreateSuccess();
          }
        }}
        projectId={projectId}
      />

      <IntegrationDetailModal
        integration={selectedIntegration}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        projectId={projectId}
      />
    </>
  );
}

