import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

export default function UploadState({ onFileSelect }) {
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Os arquivos vão para o backend como estão: não redimensione nem comprima
  // aqui. O modelo precisa da foto original do drone (5472x3078); reduzida,
  // a detecção cai pela metade sem dar erro.
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0 && onFileSelect) {
      onFileSelect(files);
    }
    // Limpa o input para que escolher o mesmo arquivo de novo dispare o onChange.
    event.target.value = '';
  };

  return (
    <div className="flex flex-col items-center text-center animate-fade-in">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />

      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Upload className="w-7 h-7 text-gray-600" strokeWidth={1.8} />
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Fazer upload de foto
      </h2>
      <p className="text-gray-500 text-sm mb-8 max-w-xs">
        Selecione uma ou mais imagens para serem analisadas pela nossa IA.
      </p>

      <button
        type="button"
        onClick={handleButtonClick}
        className="bg-zinc-900 hover:bg-black text-white text-sm font-semibold px-8 py-3 rounded-full transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
      >
        Escolher imagens
      </button>
    </div>
  );
}