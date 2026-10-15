import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

export default function UploadState({ onFileSelect }) {
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
    <div className="flex flex-col items-center text-center animate-fade-in">
      {/* Input invisível para seleção de arquivo */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Ícone de Upload */}
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Upload className="w-7 h-7 text-gray-600" strokeWidth={1.8} />
      </div>

      {/* Texto explicativo */}
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Fazer upload de foto
      </h2>
      <p className="text-gray-500 text-sm mb-8 max-w-xs">
        Selecione uma imagem para ser analisada pela nossa IA.
      </p>

      {/* Botão de ação */}
      <button
        type="button"
        onClick={handleButtonClick}
        className="bg-zinc-900 hover:bg-black text-white text-sm font-semibold px-8 py-3 rounded-full transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
      >
        Escolher arquivo
      </button>
    </div>
  );
}