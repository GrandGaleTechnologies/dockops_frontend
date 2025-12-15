import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

export function MasterAutoSyncControl() {
	const [isEnabled, setIsEnabled] = useState(true);

	return (
		<Card className="bg-card rounded-2xl border border-border">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Master Auto-Sync Control</CardTitle>
						<CardDescription className="mt-2">
							Global Auto-Sync has been {isEnabled ? 'enabled' : 'disabled'}. Automatic syncs will{' '}
							{isEnabled ? 'run' : 'not run'}.
						</CardDescription>
					</div>
					<Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
				</div>
			</CardHeader>
		</Card>
	);
}

