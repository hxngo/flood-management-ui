'use client';

import React from 'react';
import Link from 'next/link';
import WorldMapPopup from '@/components/WorldMapPopup';

export default function WorldMapPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="bg-white shadow-sm border-b mb-6 p-4 rounded-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                World Map Viewer
              </h1>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">World Climate Resilience Infrastructure Projects Map</h2>
            <WorldMapPopup height="600px" />
            <div className="bg-blue-50 p-4 rounded-md mt-4">
              <p className="text-sm text-blue-700">
                <span className="font-bold">Interactive World Map:</span> This map shows flood management projects and environmental data worldwide.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
