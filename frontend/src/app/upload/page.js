'use client';

import Image from "next/image";
import UploadForm from "../../components/upload/UploadForm";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function UploadPage() {
    const router = useRouter();
    
    useEffect(() => {}, []);
    
    return (
        <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
            {/* Upload Form */}
            <UploadForm />
            <div className="mt-4" style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
            <button 
                onClick={() => router.push('/')}
                style={{backgroundColor: 'black', fontFamily: 'hubot', padding: '0.9rem',
                borderRadius: '5rem', cursor: 'pointer'
            }} 
            onMouseEnter={(e) => e.target.style.backgroundColor = 'blue'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'black'}
            >GO BACK</button>
            </div>
        </div>
        </div>
    );
    }