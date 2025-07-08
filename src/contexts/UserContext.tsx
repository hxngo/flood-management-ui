'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ColorPalette } from '@/utils/colorExtractor';

interface UserContextType {
  userName: string;
  setUserName: (name: string) => void;
  profileImage: string | null;
  setProfileImage: (image: string | null) => void;
  currentColors: ColorPalette;
  setCurrentColors: (colors: ColorPalette) => void;
  gradientStyle: { background: string };
  setGradientStyle: (style: { background: string }) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userName, setUserName] = useState<string>('GREEN CLIMATE FUND');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [currentColors, setCurrentColors] = useState<ColorPalette>({
    primary: '#2E7D32',
    secondary: '#66BB6A',
    tertiary: '#C8E6C9'
  });
  const [gradientStyle, setGradientStyle] = useState({
    background: 'linear-gradient(to right, #2E7D32, #66BB6A, #C8E6C9)'
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Load data from localStorage when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUserName = localStorage.getItem('gcf_userName');
      const savedIsLoggedIn = localStorage.getItem('gcf_isLoggedIn');
      
      if (savedUserName && savedIsLoggedIn === 'true') {
        setUserName(savedUserName);
        setIsLoggedIn(true);
      }
    }
  }, []);

  // Save to localStorage when user name changes
  const handleSetUserName = (name: string) => {
    setUserName(name);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gcf_userName', name);
    }
  };

  // Save to localStorage when login status changes
  const handleSetIsLoggedIn = (status: boolean) => {
    setIsLoggedIn(status);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gcf_isLoggedIn', status.toString());
      if (!status) {
        // Clear localStorage on logout
        localStorage.removeItem('gcf_userName');
        localStorage.removeItem('gcf_isLoggedIn');
      }
    }
  };

  return (
    <UserContext.Provider
      value={{
        userName,
        setUserName: handleSetUserName,
        profileImage,
        setProfileImage,
        currentColors,
        setCurrentColors,
        gradientStyle,
        setGradientStyle,
        isLoggedIn,
        setIsLoggedIn: handleSetIsLoggedIn,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
