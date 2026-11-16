import React, { useEffect, useState } from 'react';
import { Download, Eye, Expand, Loader2, Upload, X } from 'lucide-react';
import exampleBoxes from '../exemplo_caixas.jpg';

export default function LoadingState({
  progress,
  results = [],
  isComplete = false,
  onNewImages,
}) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(0);
  const previewRef = React.useRef(null);
  const result = results[selectedResult];
  const imageSource = result?.image_data || exampleBoxes;
  // saude_ativa=false quando o backend roda so com deteccao (AGAVE_SAUDE=0):
  // nesse caso nao ha classificacao e os campos de saude vem null.
  const saudeAtiva = result?.saude_ativa === true;
  const suspeitas = saudeAtiva ? result.doentes : null;

  useEffect(() => {
    if (!isPreviewOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsPreviewOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewOpen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === previewRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }

    if (previewRef.current?.requestFullscreen) {
      previewRef.current.requestFullscreen();
    }
  };

  return (
    <div className="flex flex-col items-center text-center animate-fade-in">
      {isComplete ? (
        <>
          <div className="mb-6 flex w-full flex-col items-center gap-6 sm:flex-row sm:items-start sm:text-left">
            <div className="flex min-w-0 flex-1 flex-col items-center">
              <img
                src={imageSource}
                alt="Imagem identificada pelo backend"
                className="mb-4 max-h-52 w-full cursor-zoom-in rounded-2xl object-contain"
                onClick={() => setIsPreviewOpen(true)}
              />
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  Visualizar imagem
                </button>
                <a
                  href={imageSource}
                  download={`agaves_${result?.filename || 'identificadas.jpg'}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Baixar foto
                </a>
              </div>
            </div>

            <section
              aria-labelledby="identification-summary-title"
              className="w-full shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 sm:w-48"
            >
              <h3
                id="identification-summary-title"
                className="border-b border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-900"
              >
                Resumo da identificação
              </h3>
              <dl className="divide-y divide-gray-200">
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <dt className="text-xs leading-tight text-gray-500">Agaves detectadas</dt>
                  <dd className="text-lg font-bold text-gray-900">{result?.total_agaves ?? 0}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <dt className="text-xs leading-tight text-gray-500">Sem suspeita</dt>
                  {saudeAtiva ? (
                    <dd className="text-lg font-bold text-gray-900">{result.sadias}</dd>
                  ) : (
                    <dd className="text-sm font-semibold text-gray-500">Não informado</dd>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <dt className="text-xs leading-tight text-gray-500">Com suspeita de doença</dt>
                  {saudeAtiva ? (
                    <dd className={`text-lg font-bold ${suspeitas > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {suspeitas}
                    </dd>
                  ) : (
                    <dd className="text-sm font-semibold text-gray-500">Não informado</dd>
                  )}
                </div>
              </dl>
            </section>
          </div>
          <p className="mb-4 max-w-xl text-xs leading-relaxed text-gray-500">
            {!saudeAtiva
              ? 'O modelo detecta a presença de agaves, mas a classificação de saúde está desligada no servidor.'
              : suspeitas > 0
                ? 'As caixas vermelhas marcam as plantas com suspeita de doença, com a probabilidade estimada pelo modelo (de 0 a 1). É uma triagem: confirme em campo antes de qualquer decisão.'
                : 'Nenhuma planta com suspeita de doença nesta imagem. É uma triagem automática: na dúvida, confira em campo.'}
          </p>
          {result?.avisos?.length > 0 && (
            <div className="mb-4 w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-800">
              {result.avisos.map((aviso) => <p key={aviso}>{aviso}</p>)}
            </div>
          )}
          {results.length > 1 && (
            <div className="mb-4 flex flex-wrap justify-center gap-2">
              {results.map((item, index) => (
                <button
                  type="button"
                  key={`${item.filename}-${index}`}
                  onClick={() => setSelectedResult(index)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    selectedResult === index
                      ? 'bg-zinc-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}. {item.filename}
                  {item.saude_ativa && item.doentes > 0 && (
                    <span
                      className={`ml-1.5 ${selectedResult === index ? 'text-red-300' : 'text-red-600'}`}
                      title={`${item.doentes} com suspeita de doença`}
                    >
                      • {item.doentes}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={onNewImages}
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Enviar novas imagens
          </button>
        </>
      ) : (
        <div className="mb-6">
          <Loader2 className="w-10 h-10 text-gray-900 animate-spin" strokeWidth={2.2} />
        </div>
      )}

      <h2 className="text-xl font-bold text-gray-900 mb-2">
        {isComplete ? 'Identificação concluída' : 'Analisando imagem...'}
      </h2>
      <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
        {isComplete
          ? `Confira os resultados de ${results.length} imagem${results.length === 1 ? '' : 'ns'}.`
          : `Processando imagem ${progress?.current || 1} de ${progress?.total || 1}. Cada imagem pode levar cerca de 13 segundos.`}
      </p>

      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Visualização da imagem identificada"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            ref={previewRef}
            className="relative flex max-h-full max-w-4xl items-center justify-center rounded-2xl bg-white p-3 shadow-2xl fullscreen:bg-black fullscreen:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute right-5 top-5 z-10 flex gap-2">
              <button
                type="button"
                onClick={handleFullscreen}
                className="rounded-full bg-white/90 p-2 text-gray-900 shadow transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                aria-label={isFullscreen ? 'Sair da tela cheia' : 'Exibir imagem em tela cheia'}
                title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
              >
                <Expand className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="rounded-full bg-white/90 p-2 text-gray-900 shadow transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                aria-label="Fechar visualização"
                title="Fechar"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <img
              src={imageSource}
              alt="Imagem identificada em tamanho ampliado"
              className="max-h-[85vh] w-auto max-w-full rounded-xl object-contain fullscreen:max-h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}