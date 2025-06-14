"use client";

import React, { useEffect, useState } from 'react';


function MenuBlock() {
    return (
    
     <div className='top-right-hud'>
      <div style={{ backgroundColor: 'black', width: '8rem', height: '3rem', top: '1rem',
        right: '1rem', position: 'fixed', borderRadius: '0.6rem'}}>

      </div>
    </div>
    
  
  );
}


export function HUDright() {
  return <MenuBlock />;
}