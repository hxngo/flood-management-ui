'use client';

import { useState, useRef, useEffect, Suspense, useCallback } from 'react';
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
  const [selectedDocType, setSelectedDocType] = useState<string>('project-concept');
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [showMissingDocModal, setShowMissingDocModal] = useState(false);
  const [missingDocuments, setMissingDocuments] = useState<typeof requiredDocuments>([]);
  
  // LLM 분석 관련 상태 변수
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string>('');
  const [showPlanPreview, setShowPlanPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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

  // Load sample files (simulation)
  const loadSampleFiles = useCallback(() => {
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
  }, []);

  // Load existing project
  const loadExistingProject = useCallback((projectId: string) => {
    // Check if it's a sample project
    const sampleProjects = [
      { id: '1', name: 'Bangladesh : Flood and River-bank Erosion Risk Management Investment Program', number: '51-01' },
      { id: '2', name: 'Indonesia : Flood Management in North Java Project', number: '51-02' }
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
  }, [loadSampleFiles]);

  // Handle project ID from URL
  const handleProjectIdChange = useCallback((projectId: string | null) => {
    if (projectId) {
      setIsEditMode(true);
      setCurrentProjectId(projectId);
      loadExistingProject(projectId);
    }
  }, [loadExistingProject]);

  // Handle file upload
  const handleFileUpload = (files: FileList, category?: string) => {
    console.log('handleFileUpload called with:', files.length, 'files, category:', category); // Debug log
    setIsUploading(true);

    Array.from(files).forEach((file) => {
      console.log('Processing file:', file.name, 'size:', file.size); // Debug log
      
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

        console.log('Adding file to attachedFiles:', newFile.name, 'category:', newFile.category); // Debug log
        setAttachedFiles(prev => {
          const newList = [...prev, newFile];
          console.log('New attachedFiles length:', newList.length); // Debug log
          return newList;
        });
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

    console.log('Current attachedFiles:', attachedFiles); // Debug log
    console.log('attachedFiles.length:', attachedFiles.length); // Debug log

    // Input validation
    if (!projectData.name.trim()) {
      newErrors.push('Please enter project name.');
    }
    if (!projectData.number.trim()) {
      newErrors.push('Please enter project number.');
    }

    // Check if at least one file is uploaded (relaxed validation)
    if (attachedFiles.length === 0) {
      newErrors.push('Please upload at least one document.');
      console.log('No files attached!'); // Debug log
    }

    // Optional: Check required documents (show warning but allow creation)
    const uploadedCategories = new Set(attachedFiles.map(file => file.category));
    const missingDocs = requiredDocuments.filter(doc => !uploadedCategories.has(doc.key));
    
    if (missingDocs.length > 0) {
      console.warn('Missing documents:', missingDocs.map(doc => doc.label));
      // Allow creation but log warning
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Start LLM analysis process
    setIsAnalyzing(true);
    setShowPlanPreview(true); // 분석 진행 화면은 보이게 유지
    setAnalysisProgress(0);

    // Simulate analysis progress with intervals
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        const newProgress = prev + Math.random() * 15;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 700);

    // Simulate analysis completion
    setTimeout(() => {
      clearInterval(interval);
      setAnalysisProgress(100);
      
      // 분석이 완료되면 대시보드로 자동 이동하도록 설정
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000); // 1초 후 대시보드로 이동

      // Generate project plan based on simulated file content analysis
      // This is a placeholder for actual LLM analysis
      const floodKeywords = ['flood', 'water', 'dam', 'drainage', 'river', 'jakarta', 'rain', 'monsoon', 'infrastructure'];
      const technicalTerms = ['hydraulic', 'hydrological', 'pumping', 'diversion', 'dyke', 'retention', 'watershed'];
      const planningTerms = ['emergency', 'resilience', 'mitigation', 'adaptation', 'policy', 'relocation', 'maintenance'];
      const detectedKeywords: string[] = [];
      const detectedTechnical: string[] = [];
      const detectedPlanning: string[] = [];
      
      // More sophisticated simulation of file content analysis
      attachedFiles.forEach(file => {
        // Analyze file name
        const fileName = file.name.toLowerCase();
        
        // Simulate content analysis based on file metadata and dataUrl
        // In a real implementation, we would extract and analyze the actual file content
        
        // Get file type for more specific analysis simulation
        const fileType = file.type.toLowerCase();
        const isReport = fileName.includes('report') || fileName.includes('study') || fileName.includes('assessment');
        const isTechnical = fileName.includes('technical') || fileName.includes('engineering') || fileName.includes('data');
        const isPlanning = fileName.includes('plan') || fileName.includes('strategy') || fileName.includes('policy');
        
        // Simulate different analysis based on file type
        floodKeywords.forEach(keyword => {
          // Higher detection probability for relevant file types
          const detectionProbability = 
            (isReport && keyword === 'flood') ? 0.9 : 
            (isTechnical && (keyword === 'infrastructure' || keyword === 'dam')) ? 0.85 :
            (fileName.includes(keyword)) ? 0.95 : 0.4;
            
          if (Math.random() < detectionProbability && !detectedKeywords.includes(keyword)) {
            detectedKeywords.push(keyword);
          }
        });
        
        // Detect technical terms based on file content simulation
        if (isTechnical || fileType.includes('pdf') || fileType.includes('doc')) {
          technicalTerms.forEach(term => {
            const detectionProbability = isTechnical ? 0.8 : 0.5;
            if (Math.random() < detectionProbability && !detectedTechnical.includes(term)) {
              detectedTechnical.push(term);
            }
          });
        }
        
        // Detect planning terms based on file content simulation
        if (isPlanning || isReport) {
          planningTerms.forEach(term => {
            const detectionProbability = isPlanning ? 0.9 : 0.6;
            if (Math.random() < detectionProbability && !detectedPlanning.includes(term)) {
              detectedPlanning.push(term);
            }
          });
        }
      });

      // Generate a comprehensive project plan based on detected keywords and terms
      let plan = '';
      
      // Function to get a random selection of items from an array
      const getRandomSelection = (arr: string[], count: number) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, arr.length));
      };
      
      // Build project title based on detected keywords
      let projectTitle = "Jakarta Flood Management Project Plan";
      if (detectedKeywords.includes('river')) {
        projectTitle = "Jakarta River Basin and Flood Management Project";
      } else if (detectedKeywords.includes('infrastructure')) {
        projectTitle = "Jakarta Flood Infrastructure Resilience Project";
      } else if (detectedKeywords.includes('dam') || detectedKeywords.includes('drainage')) {
        projectTitle = "Jakarta Integrated Flood Control and Drainage System";
      }
      
      // Generate overview content
      let overview = '';
      if (detectedKeywords.length > 0) {
        overview = `Project focused on ${detectedKeywords.join(', ')} management in Jakarta.`;
        if (detectedTechnical.length > 0) {
          overview += ` The project will utilize ${getRandomSelection(detectedTechnical, 3).join(', ')} technologies for effective flood control.`;
        }
      } else {
        overview = "Standard flood management project for Jakarta region.";
      }
      
      if (detectedPlanning.length > 0) {
        overview += ` Project approach emphasizes ${getRandomSelection(detectedPlanning, 2).join(' and ')}.`;
      }
      
      // Generate objectives based on detected terms
      const objectives = [];
      objectives.push("Develop comprehensive flood management systems");
      
      if (detectedKeywords.includes('infrastructure') || detectedTechnical.includes('hydraulic')) {
        objectives.push("Strengthen critical water management infrastructure");
      }
      
      if (detectedKeywords.includes('river') || detectedKeywords.includes('drainage')) {
        objectives.push("Improve river flow and drainage systems");
      }
      
      if (detectedPlanning.includes('emergency') || detectedPlanning.includes('resilience')) {
        objectives.push("Implement emergency response protocols and early warning systems");
      }
      
      if (detectedPlanning.includes('policy') || detectedPlanning.includes('adaptation')) {
        objectives.push("Develop flood adaptation policies for sustainable urban development");
      }
      
      if (detectedTechnical.includes('retention') || detectedTechnical.includes('watershed')) {
        objectives.push("Create water retention areas and watershed management solutions");
      }
      
      // Generate technical approach if technical terms were detected
      let technicalApproach = '';
      if (detectedTechnical.length > 0) {
        technicalApproach = `
## Technical Approach
${detectedTechnical.map(term => `- ${term.charAt(0).toUpperCase() + term.slice(1)} systems implementation and monitoring`).join('\n')}
`;
      }
      
      // Generate implementation plan based on detected planning terms
      const hasDetailedPlanning = detectedPlanning.length > 2;
      let implementationPlan = hasDetailedPlanning ? 
        `
## Implementation Timeline
1. Phase 1: Assessment and detailed planning (3 months)
2. Phase 2: Design and engineering (4 months)
3. Phase 3: Infrastructure development (8 months)
4. Phase 4: System integration and testing (3 months)
5. Phase 5: Deployment and community training (2 months)` :
        `
## Implementation Timeline
1. Initial assessment (1 month)
2. Planning and design (3 months)
3. Implementation (6 months)
4. Evaluation (2 months)`;
      
      // Generate resource requirements section
      const resources = [];
      resources.push("Project management team");
      resources.push("Engineering specialists");
      
      if (detectedTechnical.includes('hydraulic') || detectedTechnical.includes('hydrological')) {
        resources.push("Hydraulic/hydrological engineers");
      }
      
      if (detectedKeywords.includes('infrastructure') || detectedKeywords.includes('dam')) {
        resources.push("Construction and infrastructure teams");
      }
      
      if (detectedPlanning.includes('policy') || detectedPlanning.includes('resilience')) {
        resources.push("Policy development experts");
      }
      
      resources.push("Community engagement personnel");
      resources.push("Monitoring equipment and data analysts");
      
      // Generate risk management section if planning terms were found
      let riskManagement = '';
      if (detectedPlanning.length > 0) {
        riskManagement = `
## Risk Management
- Environmental impact assessments and mitigation strategies
- Construction delays contingency planning
- Stakeholder engagement risk reduction
- Climate change scenario planning
`;
      }
      
      // Combine all sections into a comprehensive project plan
      plan = `# ${projectTitle}

## Overview
${overview}

## Objectives
${objectives.map(obj => `- ${obj}`).join('\n')}
${technicalApproach}${implementationPlan}

## Resource Requirements
${resources.map(res => `- ${res}`).join('\n')}${riskManagement}

## Expected Outcomes
- Reduced flood impact in targeted areas
- Improved response time to flood events
- Enhanced infrastructure resilience
- Strengthened community preparedness
- Sustainable urban development alongside water management`;


      setGeneratedPlan(plan);
      setAnalysisComplete(true);

      // Save/update project data with generated plan
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
            generatedPlan: plan,
            updatedAt: new Date().toISOString()
          };
        } else {
          // Add as new project (for sample project editing)
          projects.push({
            id: currentProjectId,
            ...projectData,
            files: attachedFiles,
            generatedPlan: plan,
            createdBy: userName,
            createdAt: new Date().toISOString()
          });
        }
        
        localStorage.setItem('gcf_projects', JSON.stringify(projects));
        
        // Navigation happens when user clicks on buttons in the plan preview
      } else {
        // New project creation mode
        const newProject = {
          id: Date.now().toString(),
          ...projectData,
          files: attachedFiles,
          generatedPlan: plan,
          createdBy: userName,
          createdAt: new Date().toISOString()
        };

        const existingProjects = JSON.parse(localStorage.getItem('gcf_projects') || '[]');
        existingProjects.push(newProject);
        localStorage.setItem('gcf_projects', JSON.stringify(existingProjects));

        // Also save project data for Dashboard analysis
        localStorage.setItem('gcf_projectData', JSON.stringify({
          projectName: projectData.name,
          projectNumber: projectData.number,
          attachedFiles: attachedFiles,
          generatedPlan: plan
        }));

        // Navigation happens when user clicks on buttons in the plan preview
      }
    }, 5000);
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
              <h2 className="text-xl font-semibold text-black mb-2">Upload Your File(s)</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Upload one or more files for your project documents.
              </p>
            </div>

            {/* Unified file upload area */}
            <div className="border rounded-lg p-6 border-gray-200 mb-6">
              <div className="mb-4">
                <label htmlFor="document-type" className="block text-sm font-medium text-gray-700 mb-1">
                  Document Type
                </label>
                <select
                  id="document-type"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                >
                  {requiredDocuments.map((doc) => (
                    <option key={doc.key} value={doc.key}>{doc.label}</option>
                  ))}
                </select>
              </div>
              
              {/* File upload area */}
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  draggedOverCategory === selectedDocType 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={(e) => handleDragOver(e, selectedDocType)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, selectedDocType)}
              >
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    📄
                  </div>
                  <div className="mt-4">
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer"
                    >
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Drag and drop files here, or{' '}
                        <span className="text-green-600 hover:text-green-500">browse</span>
                      </span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT up to 10MB
                  </p>
                </div>
              </div>
            </div>
            
            {/* Document categories with uploaded files */}
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4 text-gray-900">Uploaded Documents</h3>
              <div className="space-y-4">
                {requiredDocuments.map((document) => {
                  const files = getFilesForCategory(document.key);
                  if (files.length === 0) return null;
                  
                  return (
                    <div key={document.key} className="border rounded-lg p-4 border-green-200 bg-green-50">
                      <h4 className="font-medium text-green-800 mb-2 flex items-center">
                        {document.label}
                        <span className="ml-2 text-xs text-green-700">({files.length} {files.length === 1 ? 'file' : 'files'})</span>
                      </h4>
                      
                      <div className="space-y-2">
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
                    </div>
                  );
                }).filter(Boolean)}
                
                {attachedFiles.length === 0 && (
                  <p className="text-gray-500 italic">No documents uploaded yet.</p>
                )}
              </div>
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

      {/* LLM Analysis Progress & Project Plan Modal */}
      {showPlanPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {!analysisComplete ? 'Analyzing Project Documents...' : 'Generated Project Plan'}
              </h3>
              {analysisComplete && (
                <button
                  onClick={() => setShowPlanPreview(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Analysis Progress */}
            {isAnalyzing && !analysisComplete && (
              <div className="py-6">
                <div className="mb-2 flex justify-between">
                  <span className="text-sm font-medium text-gray-700">LLM Analysis in Progress</span>
                  <span className="text-sm font-medium text-gray-700">{Math.round(analysisProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                    style={{ width: `${analysisProgress}%` }}
                  ></div>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  Analyzing your uploaded documents to generate a comprehensive project plan...
                </p>
                <div className="mt-6 flex justify-center">
                  <div className="w-10 h-10 border-t-2 border-b-2 border-green-600 rounded-full animate-spin"></div>
                </div>
              </div>
            )}

            {/* Generated Plan */}
            {analysisComplete && (
              <div>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-6 overflow-auto max-h-[50vh]">
                  {/* Render markdown content */}
                  <div className="prose max-w-none">
                    {generatedPlan.split('\n').map((line, index) => {
                      if (line.startsWith('# ')) {
                        return <h1 key={index} className="text-2xl font-bold mb-4 text-gray-900">{line.substring(2)}</h1>;
                      } else if (line.startsWith('## ')) {
                        return <h2 key={index} className="text-xl font-semibold mt-6 mb-3 text-gray-800">{line.substring(3)}</h2>;
                      } else if (line.startsWith('- ')) {
                        return <li key={index} className="ml-5 mb-1 text-gray-800 font-medium">{line.substring(2)}</li>;
                      } else if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
                        const numEnd = line.indexOf('. ');
                        const num = line.substring(0, numEnd);
                        return <div key={index} className="ml-5 mb-1 text-gray-800 font-medium">{num}. {line.substring(numEnd + 2)}</div>;
                      } else if (line.trim() === '') {
                        return <div key={index} className="h-4"></div>;
                      } else {
                        return <p key={index} className="mb-2 text-gray-800">{line}</p>;
                      }
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowPlanPreview(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Edit Project
                  </button>

                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            )}
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
        onChange={(e) => e.target.files && handleFileUpload(e.target.files, selectedDocType)}
      />
    </div>
  );
}

export default function CreateProject() {
  return <CreateProjectContent />;
}
