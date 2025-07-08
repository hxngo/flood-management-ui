'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface SearchParamsWrapperProps {
  onProjectIdChange: (projectId: string | null) => void;
}

export default function SearchParamsWrapper({ onProjectIdChange }: SearchParamsWrapperProps) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const projectId = searchParams.get('id');
    onProjectIdChange(projectId);
  }, [searchParams, onProjectIdChange]);

  return null;
}
