import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/lib/api/utils';
import logo from '@/assets/logo.png';

const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [rememberMe, setRememberMe] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		try {
			await login({ email, password });
			// Redirect to dashboard on successful login
			navigate('/');
		} catch (err: unknown) {
			setError(getErrorMessage(err));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center px-4 py-8 md:py-0">
			<Card className="w-full max-w-xl rounded-2xl shadow-lg backdrop-blur-sm">
				<CardContent className="p-4 py-6 sm:p-6 sm:py-8 md:p-8 md:py-10">
					{/* Logo */}
					<div className="flex items-center justify-center mb-6 sm:mb-8">
						<img 
							src={logo} 
							alt="logo" 
							className="w-full h-full object-contain max-w-[200px] sm:max-w-[250px] md:max-w-[300px]" 
						/>
					</div>

					{/* Sign In Title */}
					<h3 className="text-primary text-xl sm:text-2xl font-bold mb-8 sm:mb-10 md:mb-12">Sign In</h3>

					{/* Error Message */}
					{error && (
						<div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-400 text-sm">
							{error}
						</div>
					)}

					{/* Login Form */}
					<form onSubmit={handleSubmit} className="flex flex-col gap-6 sm:gap-7 md:gap-8">
						{/* Email Field */}
						<div className="flex flex-col gap-2 sm:gap-3">
							<Label htmlFor="email" className="text-white text-sm sm:text-base">
								Email address <span className="text-primary">*</span>
							</Label>
							<Input
								id="email"
								type="email"
								placeholder="Enter email address"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="text-sm sm:text-base"
							/>
						</div>

						{/* Password Field */}
						<div className="flex flex-col gap-2 sm:gap-3">
							<Label htmlFor="password" className="text-white text-sm sm:text-base">
								Password<span className="text-primary">*</span>
							</Label>
							<Input
								id="password"
								type="password"
								placeholder="Enter password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="text-sm sm:text-base"
							/>
						</div>

						{/* Remember Me and Forgot Password */}
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="remember"
									checked={rememberMe}
									onCheckedChange={(checked) => setRememberMe(checked === true)}
									className="border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
								/>
								<Label
									htmlFor="remember"
									className="text-white cursor-pointer font-normal text-sm sm:text-base"
								>
									Remember Me
								</Label>
							</div>
							<a
								href="#"
								className="text-white text-sm hover:text-primary transition-colors"
								onClick={(e) => {
									e.preventDefault();
									// Handle forgot password
								}}
							>
								Forgot password?
							</a>
						</div>

						{/* Sign In Button */}
						<Button
							type="submit"
							disabled={isLoading}
							className="w-full bg-primary hover:bg-[#ff9500] text-white font-bold py-2.5 sm:py-2 transition-colors mt-2 sm:mt-4 md:mt-5 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
						>
							{isLoading ? 'Signing in...' : 'Sign In'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default Login;

