"use client";

import React, { useEffect, useState } from 'react';


function LogoBlock() {
    return (
    
     <div className='top-left-hud'>
      <div style={{ backgroundColor: 'black', width: '18rem', height: '3rem', top: '1rem',
        left: '1rem', position: 'fixed', borderRadius: '0.6rem', display: 'flex', 
        alignItems: 'center', justifyContent: 'left', paddingLeft: '1rem'}}>
          <h1 style={{ color: 'white', fontFamily: 'inter', fontWeight: '900', 
            fontSize: '1.5rem'
          }}>GLOW</h1>
          <h1 style={{ color: 'gray', fontFamily: 'monospace', fontWeight: '300', 
            fontSize: '0.9rem', marginLeft: '0.5rem', marginTop: '0.5rem'
          }}>by MicroSofties</h1>
      </div>
    </div>
    
  
  );
}


export function HUDleft() {
  return <LogoBlock />;
}