'use client';

import React from 'react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  홍수 관리 시스템
                </h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  대시보드
                </Link>
                <Link
                  href="/table"
                  className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  데이터 관리
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <Link
                href="/"
                className="text-gray-400 hover:text-gray-500"
              >
                로그아웃
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Flood Infrastructure Management
              </h2>
              <p className="text-gray-600">재해 관리 현황</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">유</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          유효 센서
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          24개
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">63</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          정상률
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          63%
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">⚠</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          주의시설
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          3개
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    의심시설과 모델예측
                  </h3>
                  <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                    <p className="text-gray-500">차트 영역</p>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    시설별 상태 현황
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">센서</span>
                      <span className="text-sm font-medium">정상</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">차량감지기</span>
                      <span className="text-sm font-medium">정상</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">가축축보호구역</span>
                      <span className="text-sm font-medium">주의</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">공지</span>
                      <span className="text-sm font-medium">정상</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">지역</span>
                      <span className="text-sm font-medium">주의</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">단속카메라</span>
                      <span className="text-sm font-medium text-red-600">점검중</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">실시간</span>
                      <span className="text-sm font-medium">정상</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">평상시</span>
                      <span className="text-sm font-medium text-red-600">점검중</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}