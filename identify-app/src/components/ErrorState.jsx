import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center text-center animate-fade-in">
      {/* Ícone de Alerta */}
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-7 h-7 text-red-500" strokeWidth={1.8} />
      </div>

      {/* Mensagem de Erro */}
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Erro na análise
      </h2>
      <p className="text-gray-500 text-sm mb-8 max-w-xs leading-relaxed">
        Não foi possível processar esta imagem. Por favor, tente novamente.
      </p>

      {/* Botão de tentar novamente */}
      <button
        type="button"
        onClick={onRetry}
        className="bg-zinc-900 hover:bg-black text-white text-sm font-semibold px-8 py-3 rounded-full transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
      >
        Tentar novamente
      </button>
    </div>
  );
}