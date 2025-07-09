'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('monitoring');
  const [subTab, setSubTab] = useState('logs'); // logs와 plan 서브탭 선택 상태 추가
  const [selectedYear, setSelectedYear] = useState('2013');
  const [generatedReport, setGeneratedReport] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFileDropdown, setShowFileDropdown] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false); // 파일 드래그 상태

  // 줌 및 팬 상태
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  // Ethiopia coordinates for satellite imagery
  const ethiopiaCenter = { lat: 11.2138, lng: 35.0930 };
  const years = ['2013', '2014', '2016', '2020'];

  // 줌 리셋 함수
  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // 줌 인/아웃 함수
  const zoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 5));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.5));
  };

  // 마우스 휠 줌
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(Math.max(zoom + delta, 0.5), 5);
    setZoom(newZoom);
  };

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return; // 100% 이하에서는 드래그 비활성화
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setLastPosition(position);
  };

  // 드래그 중
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    e.preventDefault();
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    // 드래그 제한 (이미지가 컨테이너 밖으로 너무 많이 나가지 않도록)
    const maxMove = 200; // 최대 이동 거리
    const limitedDeltaX = Math.max(-maxMove, Math.min(maxMove, deltaX));
    const limitedDeltaY = Math.max(-maxMove, Math.min(maxMove, deltaY));
    
    setPosition({
      x: lastPosition.x + limitedDeltaX,
      y: lastPosition.y + limitedDeltaY
    });
  };

  // 드래그 종료
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 마우스가 컨테이너를 벗어났을 때
  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // 터치 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom <= 1 || e.touches.length !== 1) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setLastPosition(position);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoom <= 1 || e.touches.length !== 1) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;
    
    // 터치 드래그 제한
    const maxMove = 200;
    const limitedDeltaX = Math.max(-maxMove, Math.min(maxMove, deltaX));
    const limitedDeltaY = Math.max(-maxMove, Math.min(maxMove, deltaY));
    
    setPosition({
      x: lastPosition.x + limitedDeltaX,
      y: lastPosition.y + limitedDeltaY
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // 연도 변경 시 줌 리셋
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    resetZoom();
  };
  
  // 파일 업로드 처리 함수
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setShowUploadModal(false);
    }
  };
  
  // 파일 삭제 함수
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // 드래그 앤 드롭 함수
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setShowUploadModal(false);
    }
  };

  const projectInfo = {
    projectName: "Indonesia Jakarta Coastal Defense Strategy",
    projectNumber: "63-07",
    country: "Indonesia",
    projectStatus: "Active",
    fundingSource: "World Bank - $450 million loan",
    description: "This project aims to protect Jakarta from sea level rise and land subsidence."
  };

  const generateReport = () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      const report = `# ${projectInfo.projectName} - Comprehensive Report

## Executive Summary
This comprehensive analysis combines Plan and Monitoring data to provide insights into project status.

**Key Highlights:**
- Project Progress: 63% completed
- Current Status: ${projectInfo.projectStatus}
- Monitoring Status: ⚠️ Warning - Suspicious activity detected

## Project Overview (from Plan tab)
- **Project Name**: ${projectInfo.projectName}
- **Project Number**: ${projectInfo.projectNumber}
- **Country**: ${projectInfo.country}
- **Funding Source**: ${projectInfo.fundingSource}
- **Description**: ${projectInfo.description}

## Monitoring Insights (from Monitoring tab)
Based on real-time monitoring data:
- **Embankment Construction Phase 1**: Completed with structural integrity verified
- **Water Level Alert**: Unusual water levels detected requiring investigation
- **System Status**: Warning condition due to suspicious log activity

## Infrastructure Assessment
Climate resilience measures include:
1. **Flooding Mitigation**
   - Embankment and dike construction
   - Drainage system improvement
   - Retention basin construction
   - Flood barrier installation

2. **Drought Mitigation**
   - Reservoir construction
   - Irrigation facility improvement
   - Groundwater development

## Risk Assessment
⚠️ **Critical Alert**: Suspicious activity detected in monitoring logs requires immediate investigation.

## Recommendations
1. **URGENT**: Investigate suspicious monitoring activity
2. **Continue Progress**: Maintain 63% completion momentum
3. **Enhanced Monitoring**: Strengthen surveillance protocols
4. **Stakeholder Communication**: Regular progress updates

## Conclusion
The project demonstrates solid 63% completion progress. The comprehensive approach combining planning and real-time monitoring provides strong project oversight, though the detected suspicious activities require immediate attention.

---
**Report Generated**: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
**Data Sources**: Plan tab project information + Monitoring tab activity logs`;

      setGeneratedReport(report);
      setIsGeneratingReport(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Flood and Riverbank Erosion Risk Management Investment Program
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, User</span>
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white">👤</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex space-x-8">
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

      <main className="max-w-7xl mx-auto px-8 py-8">
        {activeTab === 'monitoring' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b">
                    <div className="flex justify-between items-center mb-3">
                      {years.map((year) => (
                        <button
                          key={year}
                          onClick={() => handleYearChange(year)}
                          className={`px-4 py-2 text-sm rounded-lg font-medium transition-all duration-300 ${
                            selectedYear === year
                              ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-102'
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${((years.indexOf(selectedYear) + 1) / years.length) * 100}%` 
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>2013</span>
                      <span>2020</span>
                    </div>
                  </div>

                  <div className="relative">
                    {/* 줌 컨트롤 */}
                    <div className="absolute top-4 left-4 z-10 flex flex-col bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
                      <button
                        onClick={zoomIn}
                        className="p-2 hover:bg-gray-100 transition-colors text-gray-700 font-bold text-lg"
                        title="Zoom In"
                      >
                        +
                      </button>
                      <div className="px-2 py-1 text-xs text-gray-600 text-center border-y border-gray-200">
                        {(zoom * 100).toFixed(0)}%
                      </div>
                      <button
                        onClick={zoomOut}
                        className="p-2 hover:bg-gray-100 transition-colors text-gray-700 font-bold text-lg"
                        title="Zoom Out"
                      >
                        −
                      </button>
                      <button
                        onClick={resetZoom}
                        className="p-2 hover:bg-gray-100 transition-colors text-gray-700 text-xs border-t border-gray-200"
                        title="Reset Zoom"
                      >
                        Reset
                      </button>
                    </div>

                    <div 
                      className={`w-full h-96 relative overflow-hidden bg-gray-800 select-none ${
                        zoom > 1 && !isDragging ? 'cursor-grab' : 
                        zoom > 1 && isDragging ? 'cursor-grabbing' : 
                        'cursor-default'
                      }`}
                      onWheel={handleWheel}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseLeave}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      ref={imageRef}
                      style={{ touchAction: 'none' }}
                    >
                      <img 
                        src={`/${selectedYear}.png`}
                        alt={`Satellite view ${selectedYear}`}
                        className={`w-full h-full object-contain transition-opacity duration-500 select-none ${
                          isDragging ? 'opacity-90' : 'opacity-100'
                        }`}
                        style={{ 
                          transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                          transformOrigin: 'center center',
                          transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.2s ease-out'
                        }}
                        onDragStart={(e) => e.preventDefault()}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full bg-gray-600 hidden items-center justify-center">
                        <p className="text-white text-center">
                          Satellite View {selectedYear}<br />
                          <span className="text-sm opacity-75">Click year buttons to change</span>
                        </p>
                      </div>
                      
                      <div className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-1 rounded text-sm flex items-center backdrop-blur-sm">
                        <span className="mr-1">📍</span>
                        Project Area
                        {isDragging && <span className="ml-2 text-xs opacity-75">Dragging...</span>}
                      </div>
                      
                      <div className="absolute top-4 right-4 bg-blue-600/90 text-white px-3 py-1 rounded text-sm font-medium backdrop-blur-sm">
                        {selectedYear}
                      </div>

                      {/* 드래그 가능 상태 표시 */}
                      {zoom > 1 && !isDragging && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                          <div className="bg-black/60 text-white px-3 py-1 rounded text-xs backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity">
                            Drag to move
                          </div>
                        </div>
                      )}

                      <div className="absolute bottom-4 right-4 bg-white/80 text-gray-800 px-2 py-1 rounded text-xs backdrop-blur-sm">
                        {ethiopiaCenter.lat.toFixed(4)}, {ethiopiaCenter.lng.toFixed(4)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Project Development Timeline
                    </h3>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-yellow-400 rounded-full p-2 mr-4">
                      <span className="text-white text-xl">⚠</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-800">Jakarta Bay Sensor Anomaly</h3>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <div className="flex items-center justify-center">
                    <div className="relative w-40 h-40">
                      <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="45" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                        <circle
                          cx="60" cy="60" r="45" stroke="#22c55e" strokeWidth="8" fill="none"
                          strokeDasharray={`${2 * Math.PI * 45}`}
                          strokeDashoffset={`${2 * Math.PI * 45 * (1 - 63 / 100)}`}
                          className="transition-all duration-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-gray-900">63%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <div className="text-lg font-medium text-gray-700">Project Progress</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg">
              {/* 서브탭 UI 추가 */}
              <div className="border-b border-gray-200">
                <div className="px-6 pt-4">
                  <div className="flex space-x-8">
                    <button
                      onClick={() => setSubTab('logs')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${subTab === 'logs'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Project Activity Logs
                    </button>
                    <button
                      onClick={() => setSubTab('plan')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${subTab === 'plan'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Project Plan
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {subTab === 'logs' && (
                  <div className="space-y-3">
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="font-medium text-gray-900">Giant Sea Wall Phase 1 Construction Completed</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">blk_001</span>
                        </div>
                        <span className="text-sm text-gray-500">Jan 15, 2024</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">자카르타 베이 방조제(NCICD) 1단계 구간 완공. 위성 및 해안 모니터링 시스템 가동으로 구조 안정성 확인됨.</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <span className="mr-1">📍</span>
                          -6.1063, 106.7912
                        </span>
                        <span className="flex items-center">
                          <span className="mr-1">#</span>
                          0x7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730...
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                          SAFE
                        </span>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <span className="font-medium text-gray-900">Land Subsidence Warning in North Jakarta</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">blk_002</span>
                        </div>
                        <span className="text-sm text-gray-500">Jan 20, 2024</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">북부 자카르타 지역에서 이상성 지반 침하 속도 감지. 예상 속도보다 15% 빠른 농도로 해수면 침입 위험이 즉시 조치 필요.</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <span className="mr-1">📍</span>
                          -6.0892, 106.8151
                        </span>
                        <span className="flex items-center">
                          <span className="mr-1">#</span>
                          0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456...
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                          WARNING
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {subTab === 'plan' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Project Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Project Name</label>
                          <p className="mt-1 text-lg text-gray-900">Indonesia Jakarta Coastal Defense Strategy</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Project Number</label>
                          <p className="mt-1 text-lg text-gray-900">63-07</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Country</label>
                          <p className="mt-1 text-lg text-gray-900">Indonesia</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Project Status</label>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            In Progress (63%)
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Funding Source</label>
                          <p className="mt-1 text-lg text-gray-900">World Bank - $450 million loan</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-b pb-4 mb-4 flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-gray-900">Jakarta Coastal Defense and Flood Management Strategy</h3>
                      <div className="flex items-center space-x-3">
                        <button
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors"
                          onClick={() => setShowUploadModal(true)}
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                          </svg>
                          Add Document
                        </button>
                        
                        {/* 파일 위젯 */}
                        <div 
                          className="relative" 
                          onMouseEnter={() => setShowFileDropdown(true)}
                          onMouseLeave={() => setShowFileDropdown(false)}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          <div className={`h-10 w-10 ${isDraggingFile ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-gray-100'} rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors relative`}>
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"></path>
                            </svg>
                            {uploadedFiles.length > 0 && (
                              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {uploadedFiles.length}
                              </span>
                            )}
                          </div>
                          
                          {/* 드롭다운 파일 목록 */}
                          {showFileDropdown && uploadedFiles.length > 0 && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                              <div className="px-3 py-2 border-b border-gray-200">
                                <h4 className="text-sm font-semibold text-gray-700">Project Documents</h4>
                              </div>
                              <div className="max-h-60 overflow-y-auto">
                                {uploadedFiles.map((file, index) => (
                                  <div key={index} className="px-3 py-2 hover:bg-gray-100 flex items-center justify-between">
                                    <div className="flex items-center">
                                      <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                      </svg>
                                      <div className="truncate w-40">
                                        <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                      </div>
                                    </div>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(index);
                                      }}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Risk Assessment</h3>
                      <p className="text-gray-700">Jakarta faces severe flooding threats from multiple sources: sea level rise, land subsidence (sinking at 25cm per year in some areas), and high rainfall during the wet season from November to March. Approximately 40% of Jakarta is below sea level, making coastal areas particularly vulnerable.</p>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium text-blue-800 mb-4">Coastal Defense & Flood Mitigation</h3>
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <span className="inline-block w-8 text-gray-600 font-medium">1.</span>
                            <span className="text-gray-800 leading-relaxed">Giant Sea Wall (NCICD) - 32km offshore seawall to protect Jakarta Bay</span>
                          </div>
                          <div className="flex items-start">
                            <span className="inline-block w-8 text-gray-600 font-medium">2.</span>
                            <span className="text-gray-800 leading-relaxed">Pluit Pumping Station upgrade - capacity increase to 16,000 liters/second</span>
                          </div>
                          <div className="flex items-start">
                            <span className="inline-block w-8 text-gray-600 font-medium">3.</span>
                            <span className="text-gray-800 leading-relaxed">East Flood Canal expansion (13.5km) connecting 13 rivers</span>
                          </div>
                          <div className="flex items-start">
                            <span className="inline-block w-8 text-gray-600 font-medium">4.</span>
                            <span className="text-gray-800 leading-relaxed">West Flood Canal dredging and wall reinforcement</span>
                          </div>
                          <div className="flex items-start">
                            <span className="inline-block w-8 text-gray-600 font-medium">5.</span>
                            <span className="text-gray-800 leading-relaxed">Ciliwung River normalization and diversion tunnel to East Flood Canal</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium text-green-800 mb-4">Water Resource Management</h3>
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <span className="inline-block w-8 text-gray-600 font-medium">1.</span>
                            <span className="text-gray-800 leading-relaxed">Jatiluhur Dam rehabilitation - primary water source for western Jakarta</span>
                          </div>
                          <div className="flex items-start">
                            <span className="inline-block w-8 text-gray-600 font-medium">2.</span>
                            <span className="text-gray-800 leading-relaxed">Groundwater extraction regulation and monitoring system</span>
                          </div>
                          <div className="flex items-start">
                            <span className="inline-block w-8 text-gray-600 font-medium">3.</span>
                            <span className="text-gray-800 leading-relaxed">Seawater desalination plant (capacity: 300,000 m³/day)</span>
                          </div>
                          <div className="flex items-start">
                            <span className="inline-block w-8 text-gray-600 font-medium">4.</span>
                            <span className="text-gray-800 leading-relaxed">Cisadane-Ciliwung water transfer canal construction</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Project Comprehensive Report</h2>
                  <p className="text-sm text-gray-600 mt-1">LLM-generated analysis combining Plan and Monitoring data</p>
                </div>
                <button
                  onClick={generateReport}
                  disabled={isGeneratingReport}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    isGeneratingReport
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isGeneratingReport ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </div>
                  ) : (
                    'Generate Report'
                  )}
                </button>
              </div>
            </div>

            {generatedReport && (
              <div className="bg-white shadow rounded-lg p-8">
                <div className="prose prose-lg max-w-none">
                  <div className="markdown-content" style={{ whiteSpace: 'pre-line' }}>
                    {generatedReport.split('\n').map((line, index) => {
                      if (line.startsWith('# ')) {
                        return <h1 key={index} className="text-3xl font-bold text-gray-900 mb-6">{line.substring(2)}</h1>;
                      }
                      if (line.startsWith('## ')) {
                        return <h2 key={index} className="text-2xl font-semibold text-gray-800 mb-4 mt-8">{line.substring(3)}</h2>;
                      }
                      if (line.includes('⚠️')) {
                        return <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-3 my-4"><p className="text-yellow-800">{line}</p></div>;
                      }
                      if (line.includes('**') && line.includes('**')) {
                        return <p key={index} className="text-gray-700 mb-3 leading-relaxed font-semibold">{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
                      }
                      if (line.trim().startsWith('- ')) {
                        return <li key={index} className="text-gray-700 mb-1 ml-4">{line.substring(2)}</li>;
                      }
                      if (line.trim() === '') {
                        return <br key={index} />;
                      }
                      if (line.trim().startsWith('---')) {
                        return <hr key={index} className="my-6 border-gray-300" />;
                      }
                      return <p key={index} className="text-gray-700 mb-3 leading-relaxed">{line}</p>;
                    })}
                  </div>
                </div>
              </div>
            )}

            {!generatedReport && !isGeneratingReport && (
              <div className="bg-white shadow rounded-lg p-8">
                <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Climate Resilience Infrastructure Construction Project</h1>
                <div className="space-y-8">
                  <div className="border-l-4 border-green-500 pl-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Flooding</h2>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <span className="inline-block w-8 text-gray-600 font-medium">1.</span>
                        <span className="text-gray-800 leading-relaxed">Embankment and dike construction</span>
                      </div>
                      <div className="flex items-start">
                        <span className="inline-block w-8 text-gray-600 font-medium">2.</span>
                        <span className="text-gray-800 leading-relaxed">Drainage system improvement</span>
                      </div>
                      <div className="flex items-start">
                        <span className="inline-block w-8 text-gray-600 font-medium">3.</span>
                        <span className="text-gray-800 leading-relaxed">Retention basin/detention pond construction</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Drought</h2>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <span className="inline-block w-8 text-gray-600 font-medium">1.</span>
                        <span className="text-gray-800 leading-relaxed">Reservoir/dam construction and expansion</span>
                      </div>
                      <div className="flex items-start">
                        <span className="inline-block w-8 text-gray-600 font-medium">2.</span>
                        <span className="text-gray-800 leading-relaxed">Irrigation facility improvement</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 파일 업로드 모달 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium text-gray-900">Upload Documents</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file-upload">
                Select files to upload
              </label>
              <div 
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${isDraggingFile ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} border-dashed rounded-md transition-colors`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                      <span>Browse files</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileUpload} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX up to 10MB</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </button>
              <label 
                htmlFor="file-upload-btn"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Upload Files
                <input 
                  id="file-upload-btn" 
                  type="file" 
                  className="hidden" 
                  multiple 
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}