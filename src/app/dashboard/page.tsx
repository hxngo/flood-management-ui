'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Project information type definition
interface ProjectInfo {
  projectName: string;
  projectNumber: string;
  country: string;
  projectStatus: string;
  projectType: string;
  fundingSource: string;
  sector: string;
  targetDisaster: string;
  climateInfrastructure: string;
  region: string;
  responsibleAgency: string;
  description: string;
}

// Climate resilience infrastructure type definition
interface ClimateInfrastructure {
  disaster: string;
  measures: string[];
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('plan');
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [climateInfrastructure, setClimateInfrastructure] = useState<ClimateInfrastructure[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    // Load user information
    const savedUserName = localStorage.getItem('gcf_userName');
    if (savedUserName) {
      setUserName(savedUserName);
    }

    // Load and analyze project data
    analyzeProjectDocuments();
  }, []);
  // Document analysis using LLM
  const analyzeProjectDocuments = async () => {
    setIsAnalyzing(true);
    
    try {
      // Get the latest project data from localStorage
      const existingProjects = JSON.parse(localStorage.getItem('gcf_projects') || '[]');
      const latestProject = existingProjects[existingProjects.length - 1];
      
      if (!latestProject) {
        // Use default sample data if no project data exists
        setProjectInfo({
          projectName: "Dhaka Flood Management Project",
          projectNumber: "51-01",
          country: "Bangladesh",
          projectStatus: "Active",
          projectType: "Grant",
          fundingSource: "UK-ASEAN Green Finance Trust Fund $10 million",
          sector: "Rural Development / Rural Flood Prevention",
          targetDisaster: "Flooding",
          climateInfrastructure: "Dike Construction/Reinforcement",
          region: "Dhaka Station Area",
          responsibleAgency: "District Regional Government",
          description: "This project will support the government to achieve the outcome of having an effective and sustainable flood risk management system in operation and effectively maintained."
        });
        setDefaultClimateInfrastructure();
        setIsAnalyzing(false);
        return;
      }

      // Call API for document analysis
      const response = await fetch('/api/analyze-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documents: latestProject.files || [],
          projectData: {
            name: latestProject.name,
            number: latestProject.number
          }
        })
      });

      if (!response.ok) {
        throw new Error('API call failed');
      }

      const analysisResult = await response.json();
      setProjectInfo(analysisResult.projectInfo);
      setClimateInfrastructure(analysisResult.climateInfrastructure);

    } catch (error) {
      console.error('Document analysis error:', error);
      setDefaultProjectInfo();
      setDefaultClimateInfrastructure();
    }
    
    setIsAnalyzing(false);
  };
  const setDefaultProjectInfo = () => {
    setProjectInfo({
      projectName: "Dhaka Flood Management Project",
      projectNumber: "51-01",
      country: "Bangladesh",
      projectStatus: "Active",
      projectType: "Grant",
      fundingSource: "UK-ASEAN Green Finance Trust Fund $10 million",
      sector: "Rural Development / Rural Flood Prevention",
      targetDisaster: "Flooding",
      climateInfrastructure: "Dike Construction/Reinforcement",
      region: "Dhaka Station Area",
      responsibleAgency: "District Regional Government",
      description: "This project will support the government to achieve the outcome of having an effective and sustainable flood risk management system in operation and effectively maintained. An investment of approximately $275 million is expected, with three outcomes: (i) enhanced institutional and planning capacity for flood risk management, (ii) rehabilitation and improvement of the Hong Taybinhriver and Ma river embankment systems, and (iii) modernization of flood forecasting and early warning systems for the Hong Taybinh and Ma rivers."
    });
  };

  const setDefaultClimateInfrastructure = () => {
    setClimateInfrastructure([
      {
        disaster: "Flooding",
        measures: [
          "Embankment and dike construction",
          "Drainage system improvement", 
          "Retention basin/detention pond construction",
          "Rainwater infiltration facilities",
          "Flood barrier/cutoff wall installation",
          "High ground shelter/evacuation route installation"
        ]
      },
      {
        disaster: "Drought",
        measures: [
          "Reservoir/dam construction and expansion",
          "Irrigation facility improvement",
          "Groundwater development and management system",
          "Seawater desalination facilities",
          "Rainwater collection and utilization facilities"
        ]
      },
      {
        disaster: "Heat Wave",
        measures: [
          "Shade/cooling zone installation",
          "Urban forest/green space creation",
          "Cool roof and green roof systems",
          "Air-conditioned shelter/rest areas"
        ]
      },
      {
        disaster: "Strong Wind/Typhoon",
        measures: [
          "Wind-resistant buildings and structures",
          "Windbreak forest creation",
          "Robust power infrastructure"
        ]
      },
      {
        disaster: "Sea Level Rise",
        measures: [
          "Coastal barrier/breakwater construction and reinforcement",
          "Mangrove forest restoration/creation",
          "Coastal wetland restoration",
          "Relocation or elevation of infrastructure like roads/housing to higher ground"
        ]
      }
    ]);
  };

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
      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('plan')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'plan'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Plan
            </button>
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'monitoring'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Monitoring
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reports
            </button>
          </div>
        </div>
      </nav>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-8">
        {isAnalyzing ? (
          // Analyzing state
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            <p className="mt-4 text-lg text-gray-600">Analyzing documents to generate project information...</p>
          </div>
        ) : (
          // Plan tab content
          activeTab === 'plan' && projectInfo && (
            <div className="space-y-8">
              {/* Basic project information */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Project Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Project Name</label>
                      <p className="mt-1 text-lg text-gray-900">{projectInfo.projectName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Project Number</label>
                      <p className="mt-1 text-lg text-gray-900">{projectInfo.projectNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Country/Economy</label>
                      <p className="mt-1 text-lg text-gray-900">{projectInfo.country}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Project Status</label>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {projectInfo.projectStatus}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Project Type/Support Method</label>
                      <p className="mt-1 text-lg text-gray-900">{projectInfo.projectType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Funding Source</label>
                      <p className="mt-1 text-lg text-gray-900">{projectInfo.fundingSource}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sector/Subsector</label>
                      <p className="mt-1 text-lg text-gray-900">{projectInfo.sector}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Target Disaster</label>
                      <p className="mt-1 text-lg text-gray-900">{projectInfo.targetDisaster}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Climate Resilience Infrastructure</label>
                      <p className="mt-1 text-lg text-gray-900">{projectInfo.climateInfrastructure}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Region</label>
                      <p className="mt-1 text-lg text-gray-900">{projectInfo.region}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Responsible Agency</label>
                      <p className="mt-1 text-lg text-gray-900">{projectInfo.responsibleAgency}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <p className="text-gray-900 leading-relaxed">{projectInfo.description}</p>
                </div>
              </div>
              {/* Climate resilience infrastructure construction project */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Climate Resilience Infrastructure Construction Project</h2>
                <div className="space-y-6">
                  {climateInfrastructure.map((item, index) => (
                    <div key={index} className="border-l-4 border-green-500 pl-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{index + 1}. {item.disaster}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {item.measures.map((measure, measureIndex) => (
                          <div key={measureIndex} className="bg-gray-50 rounded-lg p-3">
                            <span className="text-sm font-medium text-gray-700">
                              {measureIndex + 1}. {measure}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Re-analysis button */}
              <div className="text-center">
                <button
                  onClick={analyzeProjectDocuments}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Re-analyze Documents
                </button>
              </div>
            </div>
          )
        )}

        {/* Monitoring tab (to be implemented) */}
        {activeTab === 'monitoring' && !isAnalyzing && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Monitoring</h2>
            <p className="text-gray-600">Monitoring functionality will be implemented in the future.</p>
          </div>
        )}

        {/* Reports tab - Climate resilience infrastructure construction project report */}
        {activeTab === 'reports' && !isAnalyzing && climateInfrastructure.length > 0 && (
          <div className="bg-white shadow rounded-lg p-8">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-8 border-b-2 border-gray-200 pb-4">
              Climate Resilience Infrastructure Construction Project
            </h1>
            
            <div className="space-y-8">
              {climateInfrastructure.map((item, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {index + 1}. {item.disaster}
                  </h2>
                  
                  <div className="space-y-2">
                    {item.measures.map((measure, measureIndex) => (
                      <div key={measureIndex} className="flex items-start">
                        <span className="inline-block w-8 text-gray-600 font-medium">
                          {measureIndex + 1}.
                        </span>
                        <span className="text-gray-800 leading-relaxed">
                          {measure}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Report bottom information */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="text-center text-gray-600">
                <p className="mb-2">
                  <strong>Project Name:</strong> {projectInfo?.projectName}
                </p>
                <p className="mb-2">
                  <strong>Project Number:</strong> {projectInfo?.projectNumber}
                </p>
                <p className="text-sm">
                  Report Generated: {new Date().toLocaleDateString('en-US')}
                </p>
              </div>
            </div>

            {/* Report download/print buttons */}
            <div className="mt-8 text-center space-x-4">
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Print Report
              </button>
              <button
                onClick={analyzeProjectDocuments}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Regenerate Report
              </button>
            </div>
          </div>
        )}

        {/* Reports tab - When no data */}
        {activeTab === 'reports' && !isAnalyzing && climateInfrastructure.length === 0 && (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Climate Resilience Infrastructure Construction Project Report</h2>
            <p className="text-gray-600 mb-6">Please analyze project documents to generate a report.</p>
            <button
              onClick={analyzeProjectDocuments}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Generate Report
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
