'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { extractColorsFromImageCanvas, ColorPalette } from '@/utils/colorExtractor';

// Project data type definition
interface Project {
  id: number;
  name: string;
  image: string;
  status: 'normal' | 'warning';
}

// Sample project data
const sampleProjects: Project[] = [
  {
    id: 1,
    name: "Bangladesh : Flood and River-bank Erosion Risk Management Investment Program",
    image: "/1.png",
    status: "normal"
  },
  {
    id: 2,
    name: "Indonesia : Flood Management in North Java Project", 
    image: "/2.png",
    status: "warning"
  }
];
export default function Home() {
  const [gradientStyle, setGradientStyle] = useState({
    background: 'linear-gradient(to right, #2E7D32, #66BB6A, #C8E6C9)'
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('GREEN CLIMATE FUND');
  const [currentColors, setCurrentColors] = useState<ColorPalette>({
    primary: '#2E7D32',
    secondary: '#66BB6A',
    tertiary: '#C8E6C9'
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check login information and project information from localStorage on component mount
  useEffect(() => {
    const savedUserName = localStorage.getItem('gcf_userName');
    const savedIsLoggedIn = localStorage.getItem('gcf_isLoggedIn');
    
    if (savedUserName && savedIsLoggedIn === 'true') {
      setUserName(savedUserName);
      setIsLoggedIn(true);
    }

    // Load saved projects
    const savedProjects = localStorage.getItem('gcf_projects');
    const savedDeletedProjects = localStorage.getItem('gcf_deleted_projects');
    let deletedProjectIds: number[] = [];
    
    if (savedDeletedProjects) {
      try {
        deletedProjectIds = JSON.parse(savedDeletedProjects);
      } catch (error) {
        console.error('Error loading deleted projects:', error);
      }
    }

    // Include only undeleted sample projects
    const activeSampleProjects = sampleProjects.filter(project => 
      !deletedProjectIds.includes(project.id)
    );

    let allProjects = [...activeSampleProjects];

    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects);
        parsedProjects.forEach((project: any) => {
          if (!allProjects.find(p => p.id === parseInt(project.id))) {
            allProjects.push({
              id: parseInt(project.id),
              name: project.name || project.title || `Project ${project.id}`,
              image: "/1.png",
              status: "normal" as const
            });
          }
        });
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    }

    setProjects(allProjects);
  }, []);
  // Project delete function
  const deleteProject = (projectId: number) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    
    // Check if it's a sample project deletion
    const isSampleProject = sampleProjects.find(p => p.id === projectId);
    
    if (isSampleProject) {
      // Record sample project deletion
      const savedDeletedProjects = localStorage.getItem('gcf_deleted_projects');
      let deletedProjectIds: number[] = [];
      
      if (savedDeletedProjects) {
        try {
          deletedProjectIds = JSON.parse(savedDeletedProjects);
        } catch (error) {
          console.error('Error loading deleted projects:', error);
        }
      }
      
      if (!deletedProjectIds.includes(projectId)) {
        deletedProjectIds.push(projectId);
        localStorage.setItem('gcf_deleted_projects', JSON.stringify(deletedProjectIds));
      }
    } else {
      // Delete user-created project
      const savedProjects = localStorage.getItem('gcf_projects');
      if (savedProjects) {
        try {
          const parsedProjects = JSON.parse(savedProjects);
          const filteredProjects = parsedProjects.filter((p: any) => parseInt(p.id) !== projectId);
          localStorage.setItem('gcf_projects', JSON.stringify(filteredProjects));
        } catch (error) {
          console.error('Error deleting project:', error);
        }
      }
    }
    
    setShowDeleteConfirm(null);
  };

  // Project status change function
  const toggleProjectStatus = (projectId: number) => {
    const updatedProjects = projects.map(p => 
      p.id === projectId 
        ? { ...p, status: p.status === 'normal' ? 'warning' as const : 'normal' as const }
        : p
    );
    setProjects(updatedProjects);
  };
  const updateGradient = (palette: ColorPalette) => {
    const newGradient = {
      background: `linear-gradient(to right, ${palette.primary}, ${palette.secondary}, ${palette.tertiary})`
    };
    setGradientStyle(newGradient);
    setCurrentColors(palette);
  };

  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageSrc = e.target?.result as string;
        setProfileImage(imageSrc);
        
        const img = document.createElement('img') as HTMLImageElement;
        img.onload = () => {
          try {
            const palette = extractColorsFromImageCanvas(img);
            updateGradient(palette);
          } catch (error) {
            console.error('Color extraction error:', error);
          }
        };
        img.src = imageSrc;
      };
      reader.readAsDataURL(file);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('gcf_userName');
    localStorage.removeItem('gcf_isLoggedIn');
    localStorage.removeItem('gcf_userEmail');
    setUserName('GREEN CLIMATE FUND');
    setProfileImage(null);
    setIsLoggedIn(false);
    setGradientStyle({
      background: 'linear-gradient(to right, #2E7D32, #66BB6A, #C8E6C9)'
    });
    setCurrentColors({
      primary: '#2E7D32',
      secondary: '#66BB6A',
      tertiary: '#C8E6C9'
    });
    window.location.href = '/login';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getStatusGradient = (status: 'normal' | 'warning') => {
    if (status === 'normal') {
      return 'bg-gradient-to-t from-green-500/80 to-transparent';
    } else {
      return 'bg-gradient-to-t from-yellow-500/80 to-transparent';
    }
  };
  return (
    <div className="min-h-screen bg-white">
      {/* 1366x224 Gradient Banner */}
      <div 
        className="w-full relative pb-32"
        style={{
          ...gradientStyle,
          height: '224px'
        }}
      >
        {/* Header */}
        <header className="bg-black/90 text-white p-4">
          <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-8 h-4 border border-white bg-transparent"></div>
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                  <span className="text-white text-xs font-bold">V</span>
                </div>
              </div>
              <span className="font-medium italic">STAI-Tuned</span>
            </div>
            <div className="flex items-center space-x-4">
              {!isLoggedIn ? (
                <Link href="/login" className="text-white/80 hover:text-white transition-colors">
                  Login
                </Link>
              ) : (
                <>
                  <span className="text-white/90 text-sm">{userName}</span>
                  <button 
                    onClick={handleLogout}
                    className="text-white/80 hover:text-white transition-colors text-sm"
                  >
                    Logout
                  </button>
                </>
              )}
              <div 
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors relative overflow-hidden"
                onClick={triggerFileInput}
                title="Upload profile image to change theme colors"
              >
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white">👤</span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
                className="hidden"
              />
            </div>
          </div>
        </header>
      </div>
      {/* Logo positioned at the boundary */}
      <div className="relative -mt-16 z-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="bg-white rounded-full p-8 shadow-lg inline-block">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 flex items-center justify-center rounded-full overflow-hidden bg-gray-100">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="User Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src="/gcf-logo.svg"
                    alt="Green Climate Fund Logo"
                    width={64}
                    height={64}
                    className="w-full h-full"
                  />
                )}
              </div>
              <div>
                {isLoggedIn ? (
                  userName.split(' ').map((word, index) => (
                    <div key={index} className="text-green-600 font-bold text-lg">
                      {word}
                    </div>
                  ))
                ) : (
                  <>
                    <div className="text-green-600 font-bold text-lg">GREEN</div>
                    <div className="text-green-600 font-bold text-lg">CLIMATE</div>
                    <div className="text-green-600 font-bold text-lg">FUND</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Content Section */}
      <div className="bg-white relative z-10 pt-16">
        <div className="max-w-7xl mx-auto px-8 pb-16">
          {/* GCF Title */}
          <div className="mb-8 ml-8">
            {isLoggedIn ? (
              <>
                <h1 className="text-6xl font-bold text-black mb-4">{userName}</h1>
                <h2 className="text-2xl text-black font-medium">My Project(s):</h2>
              </>
            ) : (
              <>
                <h1 className="text-6xl font-bold text-black mb-4">GCF</h1>
                <h2 className="text-2xl text-black font-medium">Investing Project(s):</h2>
              </>
            )}
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-end mb-8 px-8">
            <div>
              <Link href="/world-map" className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 font-medium rounded-md hover:bg-green-200 transition-colors">
                <span className="mr-2">🌎</span>
                World Map
              </Link>
            </div>
          </div>

          {/* Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* First box: Add new project */}
            <Link href="/create-project" className="block">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 hover:border-green-300 hover:shadow-xl transition-all duration-200 cursor-pointer h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl text-gray-300 mb-4">+</div>
                  <p className="text-gray-500 font-medium">Add New Project</p>
                </div>
              </div>
            </Link>
            {/* Project Cards */}
            {projects.map((project) => (
              <div key={project.id} className="relative group">
                <Link href={project.id <= 2 ? `/dashboard?id=${project.id}` : `/create-project?id=${project.id}`} className="block">
                  <div className="relative rounded-lg overflow-hidden shadow-lg h-96 cursor-pointer flex flex-col">
                    {/* Satellite Image - 2/3 of the card */}
                    <div className="relative flex-[2] overflow-hidden">
                      <Image
                        src={project.image}
                        alt={project.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Gradient overlay based on project status */}
                      <div className={`absolute inset-0 ${getStatusGradient(project.status)}`}></div>
                      
                      {/* Management buttons (shown on hover) */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-y-2">
                        {/* Status change button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleProjectStatus(project.id);
                          }}
                          className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow-lg transition-colors"
                          title="Change Status"
                        >
                          <span className="text-lg">
                            {project.status === 'normal' ? '⚠️' : '✅'}
                          </span>
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setShowDeleteConfirm(project.id);
                          }}
                          className="w-10 h-10 bg-red-500/90 rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transition-colors"
                          title="Delete Project"
                        >
                          <span className="text-white text-lg">🗑️</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Project info section - 1/3 of the card */}
                    <div className="flex-1 bg-white p-4 flex flex-col justify-center">
                      <h3 className="text-base font-medium leading-tight text-black mb-2">
                        {project.name}
                      </h3>
                      {/* Status indicator */}
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-1.5 ${
                          project.status === 'normal' ? 'bg-green-400' : 'bg-yellow-400'
                        }`}></div>
                        <span className="text-xs text-gray-600">
                          {project.status === 'normal' ? 'No Issues' : 'Suspicious Logs Found'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Color Theme Indicator has been removed */}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Project</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteProject(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
