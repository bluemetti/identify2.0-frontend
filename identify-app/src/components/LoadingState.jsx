import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center text-center animate-fade-in">
      {/* Spinner de Carregamento */}
      <div className="mb-6">
        <Loader2 className="w-10 h-10 text-gray-900 animate-spin" strokeWidth={2.2} />
      </div>

      {/* Texto de progresso */}
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Analisando imagem...
      </h2>
      <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
        Nossa IA está processando sua foto e identificando os pontos.
      </p>
    </div>
  );
}