// src/hooks/useTabletLayout.ts
// Hook para detectar orientação e adaptar layout dinamicamente

import { useState, useEffect } from 'react';

export type Orientation = 'portrait' | 'landscape';
export type TabletSize = 'small' | 'medium' | 'large';

interface TabletLayoutInfo {
  orientation: Orientation;
  size: TabletSize;
  width: number;
  height: number;
  aspectRatio: string;
  isMobile: boolean;
  isTablet: boolean;
}

export function useTabletLayout(): TabletLayoutInfo {
  const [layoutInfo, setLayoutInfo] = useState<TabletLayoutInfo>(() => 
    getLayoutInfo()
  );

  useEffect(() => {
    const handleResize = () => {
      setLayoutInfo(getLayoutInfo());
    };

    const handleOrientationChange = () => {
      // Pequeno delay para garantir que as dimensões foram atualizadas
      setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return layoutInfo;
}

function getLayoutInfo(): TabletLayoutInfo {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const orientation: Orientation = width > height ? 'landscape' : 'portrait';
  
  // Detecta tamanho do tablet
  const maxDimension = Math.max(width, height);
  let size: TabletSize = 'medium';
  
  if (maxDimension < 800) {
    size = 'small'; // Tablets 7-8"
  } else if (maxDimension >= 1100) {
    size = 'large'; // Tablets 12"+
  }

  // Calcula aspect ratio recomendado para câmeras
  let aspectRatio = '9/12'; // padrão
  
  if (orientation === 'landscape') {
    aspectRatio = '16/12'; // mais largo em landscape
  } else {
    // Em portrait, adapta baseado no tamanho
    if (size === 'small') {
      aspectRatio = '3/4';
    } else if (size === 'large') {
      aspectRatio = '9/14';
    } else {
      aspectRatio = '9/12';
    }
  }

  const isMobile = maxDimension < 768;
  const isTablet = maxDimension >= 768 && maxDimension <= 1366;

  return {
    orientation,
    size,
    width,
    height,
    aspectRatio,
    isMobile,
    isTablet,
  };
}