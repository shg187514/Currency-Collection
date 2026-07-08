import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Lock, User } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore, UserRole } from '../../store/useAuthStore';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() && !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    
    if (!username.trim()) {
      setError('Username is required.');
      return;
    }
    
    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    // Hardcoded authentication
    let role: UserRole | null = null;
    
    if (username === 'admin' && password === 'admin123') role = 'admin';
    else if (username === 'uploader' && password === 'upload123') role = 'uploader';
    else if (username === 'viewer' && password === 'view123') role = 'viewer';

    if (role) {
      login({ username, role });
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-600/10" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-600/10" />
      </div>
      
      <Card className="w-full max-w-md z-10 border-white/20 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-3 pb-6 pt-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg mb-4">
            <Leaf className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            TreeSpace
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome back. Please log in to your account.
          </p>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-300">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="h-4 w-4" />
                </div>
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 h-11"
                  autoComplete="username"
                  error={error.includes('Username') || error.includes('Invalid')}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11"
                  autoComplete="current-password"
                  error={error.includes('Password') || error.includes('Invalid')}
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 pb-8 pt-4">
            <Button type="submit" className="w-full h-11 text-base shadow-md transition-all hover:shadow-lg active:scale-[0.98]">
              Log in
            </Button>
            {/* <div className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <div>admin / admin123</div>
              <div>uploader / upload123</div>
              <div>viewer / view123</div>
            </div> */}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
