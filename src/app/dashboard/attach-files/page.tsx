'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

export default function AttachFiles() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (files.length === 0) return;
    
    setUploading(true);
    
    try {
      // 실제 환경에서는 여기서 파일 업로드 API 호출
      // 예: const formData = new FormData();
      // files.forEach(file => formData.append('files', file));
      // await fetch('/api/upload-files', { method: 'POST', body: formData });
      
      // API 호출 대신 타이머로 업로드 및 분석 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 파일 목록에서 첫 번째 파일 정보를 사용하여 프로젝트 정보 생성
      const firstFile = files[0];
      const projectInfo = {
        projectName: "에티오피아 홍수 관리 계획 " + firstFile.name.split('.')[0],
        projectNumber: "FMP-" + Math.floor(1000 + Math.random() * 9000),
        country: "에티오피아",
        projectStatus: "진행 중",
        fundingSource: "국제개발협력기구",
        description: "에티오피아 블루나일강 유역의 홍수 관리 인프라 구축을 위한 계획입니다. 댐, 제방, 배수 시스템 개선 등을 포함합니다.",
        fileAttached: true,
        files: files.map(f => ({ name: f.name, size: f.size, type: f.type }))
      };

      // LLM 분석 결과 시뮬레이션 (계획 데이터)
      const planData = {
        climateInfrastructure: [
          {
            title: "홍수 방지 인프라",
            measures: [
              "제방 및 둑 건설 - 블루나일강 주변 25km 구간",
              "배수 시스템 개선 - 도시 지역 5개 지점",
              "저류지/저수지 건설 - 2개 지점"
            ]
          },
          {
            title: "가뭄 대비 인프라",
            measures: [
              "저수지/댐 건설 - 3개 지점",
              "관개시설 개선 - 농경지 1200헥타르",
              "빗물 수확 시스템 - 마을 12곳"
            ]
          }
        ],
        riskAssessment: "중간~높음 (홍수 위험 지역 인구 75,000명)"
      };

      // LLM 분석 결과 시뮬레이션 (모니터링 데이터)
      const monitoringData = {
        projectProgress: 35, // 진행률 퍼센트
        projectLogs: [
          { date: "2025-06-15", activity: "제방 공사 시작", status: "진행 중" },
          { date: "2025-05-28", activity: "환경영향평가 완료", status: "완료" },
          { date: "2025-04-10", activity: "지역 주민 의견 수렴", status: "완료" },
          { date: "2025-03-05", activity: "사업 계획 승인", status: "완료" }
        ],
        satelliteData: {
          years: ["2013", "2014", "2016", "2020"],
          currentYear: "2020"
        }
      };

      // 프로젝트 정보를 localStorage에 저장
      localStorage.setItem('flood_management_attached_file', JSON.stringify({
        ...projectInfo,
        planData,
        monitoringData
      }));
      
      setUploadSuccess(true);
      
      // 2초 후 대시보드로 리디렉션
      setTimeout(() => {
        window.location.href = '/dashboard'; // 다이렉트 리디렉션 (Next.js router 사용 가능하나 간단히 구현)
      }, 2000);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* 헤더 */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">프로젝트 파일 첨부</h1>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            대시보드로 돌아가기
          </Link>
        </div>
      </div>
      
      {/* 메인 콘텐츠 */}
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleSubmit}>
            {/* 파일 업로드 영역 */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">파일을 이곳에 드래그하거나 클릭하여 업로드하세요</h3>
              <p className="mt-1 text-sm text-gray-500">
                지원되는 파일 형식: PDF, DOCX, XLSX, JPG, PNG (최대 10MB)
              </p>
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                multiple
              />
            </div>
            
            {/* 선택된 파일 목록 */}
            {files.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">선택된 파일 ({files.length})</h3>
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 업로드 버튼 */}
            <div className="mt-8 flex justify-end space-x-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={files.length === 0 || uploading}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none ${
                  files.length === 0 || uploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    업로드 중...
                  </>
                ) : (
                  '파일 업로드'
                )}
              </button>
            </div>
          </form>
          
          {/* 업로드 성공 메시지 */}
          {uploadSuccess && (
            <div className="mt-4 bg-green-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    파일이 성공적으로 업로드되었습니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
