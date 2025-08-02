"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import of the actual map component to avoid SSR issues
const DynamicMap = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div style={{position: 'fixed', top: '50vh', right: '46vh' }}> <h1 style={{ fontSize: '2rem'}}>A MicroSofties Application</h1></div>
});

export function MapView() {
  return (
    <div
      style={{
        position: 'fixed',        // or 'absolute' if you prefer
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,               // push it behind everything else
      }}
    >
      <DynamicMap />
    </div>
  );
}