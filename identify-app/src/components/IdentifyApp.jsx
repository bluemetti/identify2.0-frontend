import React, { useEffect, useRef, useState } from 'react';
import Header from './Header';
import UploadState from './UploadState';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import HelpButton from './HelpButton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function IdentifyApp() {
  // 'upload' | 'loading' | 'result' | 'error'
  const [status, setStatus] = useState('upload');
  const [results, setResults] = useState([]);
  const [currentFile, setCurrentFile] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const abortControllerRef = useRef(null);

  const handleFileSelect = async (files) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setResults([]);
    setTotalFiles(files.length);
    setCurrentFile(0);
    setErrorMessage('');
    setStatus('loading');

    try {
      const processedResults = [];

      for (let index = 0; index < files.length; index += 1) {
        setCurrentFile(index + 1);
        const formData = new FormData();
        formData.append('file', files[index]);

        const response = await fetch(`${API_URL}/api/analyze`, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Não foi possível processar a imagem.');
        }

        processedResults.push(data);
        setResults([...processedResults]);
      }

      setStatus('result');
    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }
      setErrorMessage(
        error instanceof TypeError
          ? 'Não foi possível conectar ao backend. Verifique se a porta 8000 está pública e se o backend está em execução.'
          : error.message,
      );
      setStatus('error');
    }
  };

  const handleRetry = () => {
    abortControllerRef.current?.abort();
    setResults([]);
    setErrorMessage('');
    setStatus('upload');
  };

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4 relative font-sans">
      <Header />

      {/* Card Central */}
      <main className="bg-white w-full max-w-3xl rounded-3xl border border-gray-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-10 md:p-14 flex flex-col items-center justify-center min-h-[380px]">
        {status === 'upload' && (
          <UploadState onFileSelect={handleFileSelect} />
        )}

        {status === 'loading' && (
          <LoadingState progress={{ current: currentFile, total: totalFiles }} />
        )}

        {status === 'result' && (
          <LoadingState results={results} isComplete onNewImages={handleRetry} />
        )}

        {status === 'error' && (
          <ErrorState onRetry={handleRetry} message={errorMessage} />
        )}
      </main>

      <HelpButton />
    </div>
  );
}