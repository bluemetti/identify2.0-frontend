import React, { useState } from 'react';
import Header from './Header';
import UploadState from './UploadState';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import HelpButton from './HelpButton';

export default function IdentifyApp() {
  // 'upload' | 'loading' | 'error'
  const [status, setStatus] = useState('upload');

  const handleFileSelect = (file) => {
    console.log('Arquivo recebido:', file.name);
    setStatus('loading');

    // Simulação de requisição de IA (3 segundos)
    setTimeout(() => {
      // Altere para simular sucesso ou erro
      setStatus('error');
    }, 3000);
  };

  const handleRetry = () => {
    setStatus('upload');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4 relative font-sans">
      <Header />

      {/* Card Central */}
      <main className="bg-white w-full max-w-lg rounded-3xl border border-gray-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-10 md:p-14 flex flex-col items-center justify-center min-h-[380px]">
        {status === 'upload' && (
          <UploadState onFileSelect={handleFileSelect} />
        )}

        {status === 'loading' && (
          <LoadingState />
        )}

        {status === 'error' && (
          <ErrorState onRetry={handleRetry} />
        )}
      </main>

      <HelpButton />
    </div>
  );
}