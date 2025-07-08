'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  uploadedAt: string;
  category: string;
}

// Required document categories
const requiredDocuments = [
  { key: 'project-concept', label: 'Project Concept Note' },
  { key: 'feasibility-study', label: 'Detailed Feasibility Study Report' },
  { key: 'technical-assistance', label: 'Technical Assistance Report' },
  { key: 'procurement-plan', label: 'Procurement Plan' },
  { key: 'design-monitoring', label: 'Design and Monitoring Framework' },
  { key: 'loan-agreement', label: 'Draft Loan/Grant Agreement' },
  { key: 'president-report', label: 'Report and Recommendation of the President' }
];

export default function EditProject() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [projectData, setProjectData] = useState({
    name: '',
    number: ''
  });
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [draggedOverCategory, setDraggedOverCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Load user information
    const savedUserName = localStorage.getItem('gcf_userName');
    const isLoggedIn = localStorage.getItem('gcf_isLoggedIn');
    
    if (!isLoggedIn || !savedUserName) {
      router.push('/login');
      return;
    }
    
    setUserName(savedUserName);

    // Load project data
    loadProjectData();
  }, [router, projectId]);

  const loadProjectData = () => {
    setIsLoading(true);
    
    // Find project data from localStorage
    const savedProjects = localStorage.getItem('gcf_projects');
    if (savedProjects) {
      try {
        const projects = JSON.parse(savedProjects);
        const project = projects.find((p: any) => p.id === projectId);
        
        if (project) {
          setProjectData({
            name: project.name || project.title || '',
            number: project.number || ''
          });
          setAttachedFiles(project.files || []);
        }
      } catch (error) {
        console.error('Project load error:', error);
      }
    }
    
    // Set default data for sample projects
    const sampleNames: any = {
      '1': 'Bangladesh : Flood and River-bank Erosion Risk Management Investment Program',
      '2': 'Indonesia : Flood Management in North Java Project',
      '3': 'Vietnam : Mekong Delta Climate Resilience Project',
      '4': 'Philippines : Metro Manila Flood Management Project'
    };
    
    if (sampleNames[projectId]) {
      setProjectData({
        name: sampleNames[projectId],
        number: `${projectId}-01`
      });
    }
    
    setIsLoading(false);
  };
  // Handle file upload
  const handleFileUpload = (files: FileList, category?: string) => {
    setIsUploading(true);

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => [...prev, `${file.name} exceeds 10MB limit.`]);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newFile: AttachedFile = {
          id: Date.now().toString() + Math.random().toString(36),
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: e.target?.result as string,
          uploadedAt: new Date().toISOString(),
          category: category || 'general'
        };

        setAttachedFiles(prev => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });

    setIsUploading(false);
  };

  // Remove file
  const removeFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  // Save project
  const handleSave = () => {
    // Save to localStorage
    const savedProjects = localStorage.getItem('gcf_projects');
    let projects = [];
    
    if (savedProjects) {
      try {
        projects = JSON.parse(savedProjects);
      } catch (error) {
        console.error('Project load error:', error);
      }
    }

    // Update existing project or add new project
    const existingIndex = projects.findIndex((p: any) => p.id === projectId);
    const updatedProject = {
      id: projectId,
      name: projectData.name,
      number: projectData.number,
      files: attachedFiles,
      createdBy: userName,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      projects[existingIndex] = updatedProject;
    } else {
      projects.push(updatedProject);
    }

    localStorage.setItem('gcf_projects', JSON.stringify(projects));
    
    // Go to dashboard
    router.push('/dashboard');
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent, category?: string) => {
    e.preventDefault();
    setDraggedOverCategory(category || null);
  };

  const handleDragLeave = () => {
    setDraggedOverCategory(null);
  };

  const handleDrop = (e: React.DragEvent, category?: string) => {
    e.preventDefault();
    setDraggedOverCategory(null);
    const files = e.dataTransfer.files;
    handleFileUpload(files, category);
  };

  // Check uploaded files by category
  const getFilesForCategory = (category: string) => {
    return attachedFiles.filter(file => file.category === category);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <p className="mt-4 text-lg text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white p-4">
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
            <span className="text-white/90 text-sm">{userName}</span>
            <Link href="/" className="text-white/80 hover:text-white transition-colors text-sm">
              Back to Main
            </Link>
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white">👤</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-green-600 hover:text-green-700 transition-colors text-sm">
            ← Back to Main
          </Link>
          <h1 className="text-4xl font-bold text-black mt-4 mb-2">
            Edit Project
          </h1>
          <p className="text-gray-600">Project ID: {projectId}</p>
        </div>

        {/* Error messages */}
        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            {errors.map((error, index) => (
              <p key={index} className="text-red-600 text-sm">{error}</p>
            ))}
          </div>
        )}

        {/* Project basic information */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectData.name}
                onChange={(e) => setProjectData({...projectData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter project name"
              />
            </div>
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Number
              </label>
              <input
                type="text"
                value={projectData.number}
                onChange={(e) => setProjectData({...projectData, number: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter project number"
              />
            </div>
          </div>
        </div>
        {/* File management section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Document Management</h2>
          
          {/* Required documents */}
          <div className="space-y-6">
            {requiredDocuments.map((document) => {
              const files = getFilesForCategory(document.key);
              const isUploaded = files.length > 0;

              return (
                <div key={document.key} className={`border rounded-lg p-6 transition-all duration-300 ${
                  isUploaded ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}>
                  <h3 className={`text-lg font-medium mb-4 ${
                    isUploaded ? 'text-green-900' : 'text-gray-900'
                  }`}>
                    {document.label}
                    {isUploaded && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Uploaded
                      </span>
                    )}
                  </h3>

                  {/* File upload area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      draggedOverCategory === document.key 
                        ? 'border-green-400 bg-green-50' 
                        : isUploaded 
                        ? 'border-green-300 bg-green-25' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={(e) => handleDragOver(e, document.key)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, document.key)}
                  >
                    <div className="text-center">
                      <div className="mx-auto h-12 w-12 text-gray-400">
                        📄
                      </div>
                      <div className="mt-4">
                        <label htmlFor={`file-${document.key}`} className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Drag and drop your file here, or{' '}
                            <span className="text-green-600 hover:text-green-500">browse</span>
                          </span>
                        </label>
                        <input
                          id={`file-${document.key}`}
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                          multiple
                          onChange={(e) => e.target.files && handleFileUpload(e.target.files, document.key)}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT up to 10MB
                      </p>
                    </div>
                  </div>
                  {/* Uploaded files list */}
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">📄</div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)} • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Remove file"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <Link 
            href="/"
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          
          <div className="flex space-x-4">
            <button
              onClick={handleSave}
              disabled={isUploading}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isUploading ? 'Uploading...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
