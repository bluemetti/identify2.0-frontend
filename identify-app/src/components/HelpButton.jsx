import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function HelpButton() {
  return (
    <button
      type="button"
      aria-label="Ajuda"
      onClick={() => alert('Precisa de ajuda? Entre em contato com o suporte.')}
      className="fixed bottom-6 right-6 w-11 h-11 bg-zinc-900 hover:bg-black text-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
    >
      <HelpCircle className="w-5 h-5" />
    </button>
  );
}