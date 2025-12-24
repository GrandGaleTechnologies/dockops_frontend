import { useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { ProjectsTable } from '@/components/dashboard/ProjectsTable';
import { CreateProjectModal } from '@/components/dashboard/CreateProjectModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Projects = () => {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	return (
		<div className="min-h-screen bg-background">
			<Header />
			<div className="container mx-auto px-4 py-8 space-y-8">
				<div className="flex justify-between items-center">
					<div className='text-2xl font-bold text-white'>
						<h2>Projects</h2>
					</div>
					<Button
						onClick={() => setIsCreateModalOpen(true)}
						className="bg-primary hover:bg-primary/90"
					>
						<Plus className="mr-2 h-4 w-4" />
						Create Project
					</Button>
				</div>

				<ProjectsTable />

				<CreateProjectModal
					open={isCreateModalOpen}
					onOpenChange={setIsCreateModalOpen}
				/>
			</div>
		</div>
	);
};

export default Projects;
