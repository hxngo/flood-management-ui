'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Set to run only on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // User database management functions
  const getUsers = (): User[] => {
    if (!isClient || typeof window === 'undefined') return [];
    const users = localStorage.getItem('gcf_users');
    return users ? JSON.parse(users) : [];
  };
  const saveUser = (user: User) => {
    if (!isClient || typeof window === 'undefined') return;
    const users = getUsers();
    users.push(user);
    localStorage.setItem('gcf_users', JSON.stringify(users));
  };

  const findUser = (email: string): User | null => {
    if (!isClient || typeof window === 'undefined') return null;
    const users = getUsers();
    return users.find(user => user.email === email) || null;
  };

  // Email format validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password strength validation
  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  // Signup process
  const handleSignup = (): boolean => {
    const newErrors: string[] = [];

    // Input validation
    if (!formData.name.trim()) {
      newErrors.push('Please enter your name.');
    }

    if (!formData.email.trim()) {
      newErrors.push('Please enter your email.');
    } else if (!validateEmail(formData.email)) {
      newErrors.push('Please enter a valid email format.');
    }

    if (!formData.password) {
      newErrors.push('Please enter your password.');
    } else if (!validatePassword(formData.password)) {
      newErrors.push('Password must be at least 6 characters long.');
    }
    // Check for existing email
    if (formData.email && findUser(formData.email)) {
      newErrors.push('This email is already registered.');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return false;
    }

    // Save new user
    const newUser: User = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      createdAt: new Date().toISOString()
    };

    saveUser(newUser);
    setErrors([]);
    return true;
  };

  // Login process
  const handleLogin = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.email.trim()) {
      newErrors.push('Please enter your email.');
    }

    if (!formData.password) {
      newErrors.push('Please enter your password.');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return false;
    }

    // Find user
    const user = findUser(formData.email);
    
    if (!user) {
      setErrors(['This email is not registered.']);
      return false;
    }

    if (user.password !== formData.password) {
      setErrors(['Password does not match.']);
      return false;
    }
    // Login success
    if (isClient && typeof window !== 'undefined') {
      localStorage.setItem('gcf_userName', user.name.toUpperCase());
      localStorage.setItem('gcf_userEmail', user.email);
      localStorage.setItem('gcf_isLoggedIn', 'true');
    }
    
    setErrors([]);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);

    try {
      // Process signup or login
      const success = isLogin ? handleLogin() : handleSignup();
      
      if (success) {
        if (!isLogin && isClient && typeof window !== 'undefined') {
          // Auto login after successful signup
          localStorage.setItem('gcf_userName', formData.name.toUpperCase());
          localStorage.setItem('gcf_userEmail', formData.email);
          localStorage.setItem('gcf_isLoggedIn', 'true');
        }
        
        // Redirect with success message
        setTimeout(() => {
          router.push('/');
        }, 100);
      }
    } catch (error) {
      setErrors(['An error occurred during processing. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error messages on input
    if (errors.length > 0) {
      setErrors([]);
    }
  };
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        {/* Tab Switcher */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              isLogin ? 'bg-white shadow-sm text-green-600' : 'text-gray-600'
            }`}
            onClick={() => {
              setIsLogin(true);
              setErrors([]);
              setFormData({ email: '', password: '', name: '' });
            }}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              !isLogin ? 'bg-white shadow-sm text-green-600' : 'text-gray-600'
            }`}
            onClick={() => {
              setIsLogin(false);
              setErrors([]);
              setFormData({ email: '', password: '', name: '' });
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Error messages */}
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            {errors.map((error, index) => (
              <p key={index} className="text-red-600 text-sm">{error}</p>
            ))}
          </div>
        )}
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your name"
                disabled={isLoading}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={isLogin ? "Enter your password" : "Password (minimum 6 characters)"}
              disabled={isLoading}
            />
          </div>
          {isLogin && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Keep me logged in
              </label>
              <a href="#" className="text-green-600 hover:underline">
                Forgot password?
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        {/* Additional Options */}
        <div className="mt-6 text-center">
          <div className="text-sm text-gray-600 mb-4">or</div>
          <button 
            type="button"
            disabled={isLoading}
            className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
          >
            Continue with Google
          </button>
        </div>

        {/* Developer info (shown only during development) */}
        {isClient && (
          <div className="mt-6 text-xs text-gray-400 text-center">
            <details>
              <summary className="cursor-pointer">Developer Info</summary>
              <div className="mt-2 p-2 bg-gray-50 rounded text-left">
                <p>Registered users: {getUsers().length}</p>
                {getUsers().length > 0 && (
                  <div className="mt-1">
                    <p className="font-semibold">Test accounts:</p>
                    {getUsers().slice(0, 3).map((user, index) => (
                      <p key={index} className="text-xs">
                        {user.email} / {user.password}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
