"use client";

import React, { useEffect, useState } from 'react';


function LogoBlock() {
    return (
    
     <div className='top-left-hud'>
      <div style={{ backgroundColor: 'black', width: '18rem', height: '80vh', top: '4.5rem',
        left: '1rem', position: 'fixed', borderRadius: '0.6rem'}}>

      </div>
    </div>
    
  
  );
}


export function HUDleftPoints() {
  return <LogoBlock />;
}