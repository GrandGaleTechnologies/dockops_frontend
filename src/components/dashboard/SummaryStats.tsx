import { Card, CardContent } from '@/components/ui/card';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { RefreshCw, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardStats, Period } from '@/lib/api/dashboard';
import { format } from 'date-fns';
import { FailedSynIcon, IntegrationIcons, LastSyncIcon, PendingSyncIcon, SuccessfulSyncIcon, SyncIcon } from '@/assets/icon';

interface StatCardProps {
	icon: React.ReactNode;
	label: string;
	value: string;
	className?: string;
}

function StatCard({ icon, label, value, className }: StatCardProps) {
	return (
		<Card className={cn('rounded-none border-none bg-transparent', className)}>
			<CardContent className="relative p-6">
				<div className="flex items-center gap-4">
					<div className="text-muted-foreground">{icon}</div>
					<div className="flex-1">
						<p className="text-sm text-muted-foreground mb-1">{label}</p>
						<p className="text-2xl font-semibold text-foreground">{value}</p>
					</div>
				</div>
				<div className="absolute right-0 top-4 bottom-4 w-px bg-border/25" />
			</CardContent>
		</Card>
	);
}

const IconWrapper = ({ icon }: { icon: React.ReactNode }) => {
	return (
		<div 
			className="size-12 rounded-full bg-card p-3 flex items-center justify-center border border-border"
			style={{
				boxShadow: '1px 1px 4px 1px #FFFFFF inset, 0px 4px 4px 1px #FFFFFF26'
			}}
		>
			{icon}
		</div>
	);
}

type SummaryStatsProps = {
	period: 'month' | 'week' | 'day';
	onPeriodChange: (value: 'month' | 'week' | 'day') => void;
};

function formatLastSyncDate(dateString: string): string {
	try {
		const date = new Date(dateString);
		return format(date, 'dd/MM/yy h:mm a');
	} catch {
		return '—';
	}
}

function formatDuration(ms: number): string {
	if (ms < 1000) {
		return `${ms}ms`;
	}
	const seconds = (ms / 1000).toFixed(1);
	return `${seconds} secs`;
}

export function SummaryStats({ period, onPeriodChange }: SummaryStatsProps) {
	const { data: stats, isLoading, error } = useDashboardStats(period as Period);

	// Show loading state or error state
	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h1 className="text-4xl font-bold text-white">Welcome Back</h1>
					<DateFilter value={period} onChange={onPeriodChange} />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-card rounded-2xl p-4 border border-border">
					{Array.from({ length: 8 }).map((_, i) => (
						<StatCard key={i} icon={<RefreshCw className="h-6 w-6" />} label="Loading..." value="—" />
					))}
				</div>
			</div>
		);
	}

	if (error || !stats) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h1 className="text-4xl font-bold text-white">Welcome Back</h1>
					<DateFilter value={period} onChange={onPeriodChange} />
				</div>
				<div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 text-red-400">
					Failed to load dashboard stats. Please try again.
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-4xl font-bold text-white">Welcome Back</h1>
				<DateFilter value={period} onChange={onPeriodChange} />
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-card rounded-2xl p-4 border border-border">
				<StatCard
					icon={<IconWrapper icon={<LastSyncIcon />} />}
					label="Last Sync at"
					value={stats.last_sync_at ? formatLastSyncDate(stats.last_sync_at) : '—'}
				/>
				<StatCard
					icon={<IconWrapper icon={<LastSyncIcon />} />}
					label="Avg. Sync Duration"
					value={formatDuration(stats.avg_sync_duration_ms)}
				/>
				<StatCard
					icon={<IconWrapper icon={<SyncIcon />} />}
					label="No. of Syncs"
					value={stats.total_syncs.toLocaleString()}
				/>
				<StatCard
					icon={<IconWrapper icon={<Folder className="h-6 w-6" />} />}
					label="No. of Projects"
					value={stats.projects.toLocaleString()}
				/>
				<StatCard
					icon={<IconWrapper icon={<IntegrationIcons />} />}
					label="No. of Integrations"
					value={stats.no_of_integrations.toLocaleString()}
				/>
				<StatCard
					icon={<IconWrapper icon={<PendingSyncIcon />} />}
					label="Pending Syncs"
					value={stats.pending_syncs.toLocaleString()}
				/>
				<StatCard
					icon={<IconWrapper icon={<FailedSynIcon />} />}
					label="Failed Syncs"
					value={stats.failed_syncs.toLocaleString()}
				/>
				<StatCard
					icon={<IconWrapper icon={<SuccessfulSyncIcon />} />}
					label="Successful Syncs"
					value={stats.successful_syncs.toLocaleString()}
				/>
			</div>
		</div>
	);
}

