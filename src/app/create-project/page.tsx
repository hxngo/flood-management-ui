'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SearchParamsWrapper from './SearchParamsWrapper';

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

function CreateProjectContent() {
  const [projectData, setProjectData] = useState({
    name: '',
    number: ''
  });
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [draggedOverCategory, setDraggedOverCategory] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [showMissingDocModal, setShowMissingDocModal] = useState(false);
  const [missingDocuments, setMissingDocuments] = useState<typeof requiredDocuments>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Handle project ID from URL
  const handleProjectIdChange = (projectId: string | null) => {
    if (projectId) {
      setIsEditMode(true);
      setCurrentProjectId(projectId);
      loadExistingProject(projectId);
    }
  };

  // Load user information
  useEffect(() => {
    const savedUserName = localStorage.getItem('gcf_userName');
    const isLoggedIn = localStorage.getItem('gcf_isLoggedIn');
    
    if (!isLoggedIn || !savedUserName) {
      router.push('/login');
      return;
    }
    
    setUserName(savedUserName);
  }, [router]);

  // Load existing project
  const loadExistingProject = (projectId: string) => {
    // Check if it's a sample project
    const sampleProjects = [
      { id: '1', name: 'Bangladesh : Flood and River-bank Erosion Risk Management Investment Program', number: '51-01' },
      { id: '2', name: 'Indonesia : Flood Management in North Java Project', number: '51-02' },
      { id: '3', name: 'Vietnam : Mekong Delta Climate Resilience Project', number: '51-03' },
      { id: '4', name: 'Philippines : Metro Manila Flood Management Project', number: '51-04' }
    ];

    const sampleProject = sampleProjects.find(p => p.id === projectId);
    if (sampleProject) {
      setProjectData({
        name: sampleProject.name,
        number: sampleProject.number
      });
      // Load sample files for sample projects
      loadSampleFiles();
      return;
    }

    // Load user-created project
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
          if (project.files) {
            setAttachedFiles(project.files);
          }
        }
      } catch (error) {
        console.error('Project load error:', error);
      }
    }
  };

  // Load sample files (simulation)
  const loadSampleFiles = () => {
    const sampleFiles: AttachedFile[] = [
      {
        id: 'sample-1',
        name: 'Project Concept Note.docx',
        size: 1024000,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        dataUrl: 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,sample',
        uploadedAt: new Date().toISOString(),
        category: 'project-concept'
      },
      {
        id: 'sample-2',
        name: 'Detailed Feasibility Study Report.docx',
        size: 2048000,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        dataUrl: 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,sample',
        uploadedAt: new Date().toISOString(),
        category: 'feasibility-study'
      }
    ];
    setAttachedFiles(sampleFiles);
  };

  // Handle file upload
  const handleFileUpload = (files: FileList, category?: string) => {
    setIsUploading(true);

    Array.from(files).forEach((file) => {
      // File size limit (10MB)
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

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectData({
      ...projectData,
      [e.target.name]: e.target.value
    });
    
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  // Handle project creation/update
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    // Input validation
    if (!projectData.name.trim()) {
      newErrors.push('Please enter project name.');
    }
    if (!projectData.number.trim()) {
      newErrors.push('Please enter project number.');
    }

    // Check required documents
    const uploadedCategories = new Set(attachedFiles.map(file => file.category));
    const missingDocs = requiredDocuments.filter(doc => !uploadedCategories.has(doc.key));
    
    if (missingDocs.length > 0) {
      setMissingDocuments(missingDocs);
      setShowMissingDocModal(true);
      
      // Scroll to first missing document
      const firstMissingDoc = missingDocs[0];
      const element = document.getElementById(`document-${firstMissingDoc.key}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Highlight section
        element.classList.add('ring-4', 'ring-red-400', 'ring-opacity-75');
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-red-400', 'ring-opacity-75');
        }, 3000);
      }
      return;
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Save/update project data
    if (isEditMode && currentProjectId) {
      // Edit mode: update existing project
      const savedProjects = localStorage.getItem('gcf_projects');
      let projects = [];
      
      if (savedProjects) {
        try {
          projects = JSON.parse(savedProjects);
        } catch (error) {
          console.error('Project load error:', error);
        }
      }
      
      // Find and update existing project
      const projectIndex = projects.findIndex((p: any) => p.id === currentProjectId);
      if (projectIndex !== -1) {
        projects[projectIndex] = {
          ...projects[projectIndex],
          ...projectData,
          files: attachedFiles,
          updatedAt: new Date().toISOString()
        };
      } else {
        // Add as new project (for sample project editing)
        projects.push({
          id: currentProjectId,
          ...projectData,
          files: attachedFiles,
          createdBy: userName,
          createdAt: new Date().toISOString()
        });
      }
      
      localStorage.setItem('gcf_projects', JSON.stringify(projects));
      
      // Go to Dashboard for analysis
      router.push('/dashboard');
    } else {
      // New project creation mode
      const newProject = {
        id: Date.now().toString(),
        ...projectData,
        files: attachedFiles,
        createdBy: userName,
        createdAt: new Date().toISOString()
      };

      const existingProjects = JSON.parse(localStorage.getItem('gcf_projects') || '[]');
      existingProjects.push(newProject);
      localStorage.setItem('gcf_projects', JSON.stringify(existingProjects));

      // Go to Dashboard
      router.push('/dashboard');
    }
  };

  // Drag and drop handlers
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

  // Get files for category
  const getFilesForCategory = (category: string) => {
    return attachedFiles.filter(file => file.category === category);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search params handler */}
      <Suspense fallback={null}>
        <SearchParamsWrapper onProjectIdChange={handleProjectIdChange} />
      </Suspense>

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
            {isEditMode ? 'Edit Project' : 'New Project'}
          </h1>
        </div>

        {/* Error messages */}
        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            {errors.map((error, index) => (
              <p key={index} className="text-red-600 text-sm">{error}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project basic information */}
          <div className="space-y-6">
            <div>
              <input
                type="text"
                name="name"
                value={projectData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-lg text-black placeholder-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Project Name"
              />
            </div>

            <div className="max-w-md">
              <input
                type="text"
                name="number"
                value={projectData.number}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-lg text-black placeholder-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Project Number"
              />
            </div>
          </div>

          {/* File upload section */}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-black mb-2">Upload Your File(s) :</h2>
              <p className="text-gray-600 leading-relaxed">
                Project concept note, Detailed feasibility study report, Technical assistance report, Procurement plan,<br />
                Design and Monitoring framework, Draft loan/grant agreement, Report and recommendation of the president
              </p>
            </div>

            {/* Required documents upload areas */}
            <div className="space-y-6">
              {requiredDocuments.map((document) => {
                const files = getFilesForCategory(document.key);
                const isUploaded = files.length > 0;

                return (
                  <div key={document.key} className={`border rounded-lg p-6 transition-all duration-300 ${
                    isUploaded ? 'border-green-300 bg-green-50' : 'border-gray-200'
                  }`} id={`document-${document.key}`}>
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
          <div className="flex justify-between items-center pt-8">
            <Link 
              href="/"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isUploading}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isUploading ? 'Uploading...' : (isEditMode ? 'Update Project' : 'Create Project')}
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* Missing documents modal */}
      {showMissingDocModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Missing Required Documents</h3>
            <p className="text-gray-600 mb-4">
              The following documents are required but not uploaded:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 mb-6 space-y-1">
              {missingDocuments.map((doc) => (
                <li key={doc.key}>{doc.label}</li>
              ))}
            </ul>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowMissingDocModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
        multiple
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
      />
    </div>
  );
}

export default function CreateProject() {
  return <CreateProjectContent />;
}
