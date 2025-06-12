"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import of the actual map component to avoid SSR issues
const DynamicMap = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div style={{ height: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading map...</div>
});

export function MapView() {
  return <DynamicMap />;
}