'use client'

import React from 'react'

export function StagewiseToolbar() {
  React.useEffect(() => {
    // Only initialize in development mode and on client side
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      import('@stagewise/toolbar').then(({ initToolbar }) => {
        const stagewiseConfig = {
          plugins: [], // Add your custom plugins here if needed
        };
        
        // Initialize the toolbar
        initToolbar(stagewiseConfig);
      }).catch((error) => {
        console.warn('Failed to load stagewise toolbar:', error);
      });
    }
  }, []);

  // This component doesn't render anything visible
  return null;
} 