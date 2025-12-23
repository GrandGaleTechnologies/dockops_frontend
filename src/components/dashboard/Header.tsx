import { Link, useLocation } from 'react-router';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import {
	Avatar,
	AvatarFallback,
} from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo.png';
import { cn } from '@/lib/utils';

export function Header() {
	const location = useLocation();
	const { user, logout } = useAuth();

	const navItems = [
		{ path: '/', label: 'Dashboard' },
		{ path: '/sync', label: 'Sync' },
		{ path: '/projects', label: 'Projects' },
	];

	// Get user initial from full_name
	const getUserInitial = (fullName: string | undefined): string => {
		if (!fullName) return '?';
		const names = fullName.trim().split(/\s+/);
		if (names.length === 0) return '?';
		if (names.length === 1) return names[0].charAt(0).toUpperCase();
		// Return first letter of first and last name
		return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
	};

	const handleLogout = async () => {
		await logout();
	};

	return (
		<header className="border-b border-border bg-card">
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center">
						<img src={logo} alt="AERIAL PROSPEX DOCK OPS" className="h-8 mr-4" />
					</div>
					<div className="flex gap-3">
						<nav className="hidden items-center gap-2 md:flex">
							{navItems.map((item) => (
								<Link key={item.path} to={item.path}>
									<Button
										variant={location.pathname === item.path ? 'default' : 'ghost'}
										className={cn(
											location.pathname === item.path &&
												'bg-primary hover:bg-primary/90'
										)}
									>
										{item.label}
									</Button>
								</Link>
							))}
						</nav>
						<div className="flex items-center gap-4">
							{/* Avatar - Hidden on mobile, shown on desktop */}
							{user && (
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="hidden md:flex rounded-full h-9 w-9"
											aria-label="User menu"
										>
											<Avatar className="h-9 w-9 cursor-pointer">
												<AvatarFallback className="bg-primary text-primary-foreground font-semibold">
													{getUserInitial(user.full_name)}
												</AvatarFallback>
											</Avatar>
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-64" align="end">
										<div className="space-y-4">
											<div className="space-y-1">
												<p className="text-sm font-semibold">{user.full_name}</p>
												<p className="text-sm text-muted-foreground">{user.email}</p>
											</div>
											<Button
												variant="outline"
												className="w-full justify-start"
												onClick={handleLogout}
											>
												<LogOut className="mr-2 h-4 w-4" />
												Logout
											</Button>
										</div>
									</PopoverContent>
								</Popover>
							)}

							{/* Mobile Menu Drawer */}
							<Drawer direction="right">
								<DrawerTrigger asChild>
									<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
										<Menu className="h-5 w-5" />
									</Button>
								</DrawerTrigger>
								<DrawerContent className="md:hidden p-4">
									<DrawerHeader className="pb-2">
										<DrawerTitle>Navigation</DrawerTitle>
									</DrawerHeader>
									<div className="flex flex-col gap-4">
										{/* Navigation Items */}
										<div className="grid gap-2">
											{navItems.map((item) => (
												<DrawerClose asChild key={item.path}>
													<Link to={item.path}>
														<Button
															variant={location.pathname === item.path ? 'default' : 'ghost'}
															className={cn(
																'w-full justify-start',
																location.pathname === item.path && 'bg-primary hover:bg-primary/90'
															)}
														>
															{item.label}
														</Button>
													</Link>
												</DrawerClose>
											))}
										</div>
										{/* User Info and Logout - Mobile Only */}
										{user && (
											<>
												<div className="border-t pt-4 mt-2">
													<div className="flex items-center gap-3 mb-4">
														<Avatar className="h-10 w-10">
															<AvatarFallback className="bg-primary text-primary-foreground font-semibold">
																{getUserInitial(user.full_name)}
															</AvatarFallback>
														</Avatar>
														<div className="flex-1 min-w-0">
															<p className="text-sm font-semibold truncate">{user.full_name}</p>
															<p className="text-sm text-muted-foreground truncate">{user.email}</p>
														</div>
													</div>
													<Button
														variant="outline"
														className="w-full justify-start"
														onClick={handleLogout}
													>
														<LogOut className="mr-2 h-4 w-4" />
														Logout
													</Button>
												</div>
											</>
										)}
									</div>
								</DrawerContent>
							</Drawer>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}

