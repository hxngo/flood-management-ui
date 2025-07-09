'use client';

import React, { useState, useRef, useEffect } from 'react';

interface SatelliteViewProps {
  selectedYear: string;
  years: string[];
  onYearChange: (year: string) => void;
  center: { lat: number; lng: number };
}

const SatelliteView: React.FC<SatelliteViewProps> = ({ 
  selectedYear, 
  years, 
  onYearChange, 
  center 
}) => {
  // 줌 및 팬 상태
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

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
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setLastPosition(position);
  };

  // 드래그 중
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setPosition({
      x: lastPosition.x + deltaX,
      y: lastPosition.y + deltaY
    });
  };

  // 드래그 종료
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 터치 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX, y: touch.clientY });
      setLastPosition(position);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoom <= 1 || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;
    
    setPosition({
      x: lastPosition.x + deltaX,
      y: lastPosition.y + deltaY
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // 연도 변경 시 줌 리셋
  useEffect(() => {
    resetZoom();
  }, [selectedYear]);
  // 연도별 위성 이미지 URL - 실제 업로드된 이미지 사용
  const getSatelliteImageUrl = (year: string) => {
    // public 폴더에 있는 실제 위성사진 파일들 사용
    return `/${year}.png`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* 연도 선택 버튼 */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex justify-between items-center mb-3">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => onYearChange(year)}
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
        
        {/* 진행률 바 */}
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

      {/* 위성 이미지 영역 */}
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
          className="w-full h-64 relative overflow-hidden bg-gray-800 cursor-grab active:cursor-grabbing"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          ref={imageRef}
        >
          {/* 실제 위성사진 이미지 */}
          <img 
            src={getSatelliteImageUrl(selectedYear)}
            alt={`Satellite view ${selectedYear}`}
            className="w-full h-full object-cover transition-opacity duration-500 select-none"
            style={{ 
              filter: `sepia(${selectedYear === '2013' ? '20' : '5'}%) saturate(110%) contrast(105%)`,
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.3s ease-out'
            }}
            onLoad={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onDragStart={(e) => e.preventDefault()}
            onError={(e) => {
              // 이미지 로드 실패 시 좀 더 위성사진 같은 대체 이미지
              const canvas = document.createElement('canvas');
              canvas.width = 600;
              canvas.height = 400;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                // 위성사진 같은 패턴 생성
                const gradient = ctx.createLinearGradient(0, 0, 600, 400);
                gradient.addColorStop(0, selectedYear === '2013' ? '#8B4513' : selectedYear === '2014' ? '#6B7280' : selectedYear === '2016' ? '#059669' : '#1D4ED8');
                gradient.addColorStop(0.5, '#4A5568');
                gradient.addColorStop(1, '#2D3748');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 600, 400);
                
                // 위성사진 같은 노이즈 패턴 추가
                for (let i = 0; i < 1000; i++) {
                  ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
                  ctx.fillRect(Math.random() * 600, Math.random() * 400, 2, 2);
                }
                
                // 텍스트 추가
                ctx.fillStyle = 'white';
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`Satellite View ${selectedYear}`, 300, 200);
                ctx.fillText('Project Area', 300, 230);
                
                e.currentTarget.src = canvas.toDataURL();
              }
            }}
          />
          
          {/* 위성 이미지 텍스처 오버레이 */}
          <div 
            className="absolute inset-0 opacity-20 mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '20px 20px'
            }}
          />
          {/* 위치 라벨 */}
          <div className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-1 rounded text-sm flex items-center backdrop-blur-sm">
            <span className="mr-1">📍</span>
            Project Area
          </div>
          
          {/* 년도 배지 */}
          <div className="absolute top-4 right-4 bg-blue-600/90 text-white px-3 py-1 rounded text-sm font-medium backdrop-blur-sm">
            {selectedYear}
          </div>

          {/* 좌표 표시 */}
          <div className="absolute bottom-4 right-4 bg-white/80 text-gray-800 px-2 py-1 rounded text-xs backdrop-blur-sm">
            {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
          </div>
        </div>
      </div>
      
      {/* 정보 영역 */}
      <div className="p-4 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Project Development Timeline
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Satellite imagery showing project area development from {selectedYear}.
          <br />
          <span className="text-xs text-gray-500">
            Use mouse wheel or +/- buttons to zoom. Drag to pan when zoomed in.
          </span>
        </p>
        
        {/* 통계 */}
        <div className="grid grid-cols-1 gap-4 text-center">
          <div className="bg-gray-50 rounded p-2">
            <div className="text-lg font-bold text-green-600">{selectedYear}</div>
            <div className="text-xs text-gray-500">Year</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SatelliteView;
