import React, { useEffect, useRef, useState } from 'react';
import Header from './Header';
import UploadState from './UploadState';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import HelpButton from './HelpButton';

// Endereço do backend. Vem do .env (VITE_API_URL) e é fixado no momento do
// build pelo Vite: mudar o .env exige reiniciar o `npm run dev` ou refazer o build.
// Sem a variável, usa o backend local (http://localhost:8000). Com
// VITE_API_URL="" (vazio), chama a API no MESMO endereço da página
// (/api/analyze): é o modo do Docker, em que o nginx repassa /api ao backend.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export default function IdentifyApp() {
  // 'upload' | 'loading' | 'result' | 'error'
  const [status, setStatus] = useState('upload');
  const [results, setResults] = useState([]);
  const [currentFile, setCurrentFile] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const abortControllerRef = useRef(null);

  const handleFileSelect = async (files) => {
    // Cancela uma análise anterior que ainda esteja em andamento, para que a
    // resposta antiga não sobrescreva os resultados novos.
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

      // Uma foto por vez, de propósito: o backend processa uma imagem por vez
      // (~13s cada). Enviar todas juntas faria as últimas estourarem o timeout.
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
      // TypeError no fetch = não houve resposta (backend fora do ar, porta
      // errada ou CORS). Os demais erros trazem a mensagem do próprio backend.
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