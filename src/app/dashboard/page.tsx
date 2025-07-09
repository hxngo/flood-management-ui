'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('plan');
  const [selectedYear, setSelectedYear] = useState('2013');
  const [generatedReport, setGeneratedReport] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

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

  const projectInfo = {
    projectName: "Bangladesh Dhaka Flood Management Project",
    projectNumber: "51-01",
    country: "Bangladesh",
    projectStatus: "Active",
    fundingSource: "Asian Development Bank - $300 million loan",
    description: "This project aims to support flood risk management systems."
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

      <main className="max-w-7xl mx-auto px-8 py-8">
        {activeTab === 'plan' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Project Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Project Name</label>
                  <p className="mt-1 text-lg text-gray-900">{projectInfo.projectName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Project Number</label>
                  <p className="mt-1 text-lg text-gray-900">{projectInfo.projectNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Country</label>
                  <p className="mt-1 text-lg text-gray-900">{projectInfo.country}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Project Status</label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {projectInfo.projectStatus}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Funding Source</label>
                  <p className="mt-1 text-lg text-gray-900">{projectInfo.fundingSource}</p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-500">Description</label>
              <p className="mt-1 text-lg text-gray-900">{projectInfo.description}</p>
            </div>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
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
                      className={`w-full h-64 relative overflow-hidden bg-gray-800 select-none ${
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
                        className={`w-full h-full object-cover transition-opacity duration-500 select-none ${
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Project Development Timeline
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Satellite imagery showing project area development from {selectedYear}.
                      <br />
                      <span className="text-xs text-gray-500">
                        <strong>Controls:</strong> Mouse wheel or +/- buttons to zoom • Click and drag to pan when zoomed in • Reset button to return to original size
                      </span>
                    </p>
                    
                    <div className="grid grid-cols-1 gap-4 text-center">
                      <div className="bg-gray-50 rounded p-2">
                        <div className="text-lg font-bold text-green-600">{selectedYear}</div>
                        <div className="text-xs text-gray-500">Year</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-yellow-400 rounded-full p-2 mr-4">
                      <span className="text-white text-xl">⚠</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-800">Suspicious Log Detected</h3>
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
              <div className="border-b border-gray-200">
                <div className="px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900">Project Activity Logs</h3>
                  <p className="text-sm text-gray-500">Blockchain-verified transactions • Real-time monitoring</p>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="font-medium text-gray-900">Embankment Construction Phase 1 Completed</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">blk_001</span>
                      </div>
                      <span className="text-sm text-gray-500">Jan 15, 2024</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">첫 번째 구간 제방 건설 완료. 위성 데이터 검증을 통해 구조적 안정성 확인.</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <span className="mr-1">📍</span>
                        23.8103, 90.4125
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
                        <span className="font-medium text-gray-900">Unusual Water Level Detected</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">blk_002</span>
                      </div>
                      <span className="text-sm text-gray-500">Jan 20, 2024</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">수위 모니터링 시스템에서 평상시보다 높은 수위가 감지되었습니다.</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <span className="mr-1">📍</span>
                        23.8234, 90.4256
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
    </div>
  );
}