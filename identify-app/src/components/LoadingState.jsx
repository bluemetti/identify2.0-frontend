import React, { useEffect, useState } from 'react';
import { Download, Eye, Expand, Loader2, Upload, X } from 'lucide-react';
import exampleBoxes from '../exemplo_caixas.jpg';

const nomeDownload = (result) => `agaves_${result?.filename || 'identificadas.jpg'}`;

// O image_data do backend é um data-URI (a imagem inteira em base64), então
// serve direto como link de download, sem nova requisição ao servidor.
function baixarImagem(href, nome) {
  const link = document.createElement('a');
  link.href = href;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

// Uma foto da lista de resultados: imagem + botoes de um lado, resumo do outro.
function ResultadoImagem({ result, index, total, onPreview }) {
  const imageSource = result?.image_data || exampleBoxes;
  // saude_ativa=false quando o backend roda so com deteccao (AGAVE_SAUDE=0):
  // nesse caso nao ha classificacao e os campos de saude vem null.
  const saudeAtiva = result?.saude_ativa === true;
  const suspeitas = saudeAtiva ? result.doentes : null;
  const tituloId = `identification-summary-title-${index}`;

  return (
    <article className="w-full border-b border-gray-100 py-6 first:pt-0 last:border-b-0 last:pb-0">
      {total > 1 && (
        <p className="mb-3 truncate text-left text-xs font-semibold text-gray-500" title={result?.filename}>
          {index + 1}. {result?.filename}
        </p>
      )}

      <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:items-start sm:text-left">
        <div className="flex min-w-0 flex-1 flex-col items-center">
          <img
            src={imageSource}
            alt={`Imagem identificada pelo backend: ${result?.filename || ''}`}
            className="mb-4 max-h-52 w-full cursor-zoom-in rounded-2xl object-contain"
            onClick={() => onPreview(index)}
          />
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => onPreview(index)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              Visualizar imagem
            </button>
            <a
              href={imageSource}
              download={nomeDownload(result)}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Baixar foto
            </a>
          </div>
        </div>

        <section
          aria-labelledby={tituloId}
          className="w-full shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 sm:w-48"
        >
          <h3
            id={tituloId}
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

      {result?.avisos?.length > 0 && (
        <div className="mt-4 w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-800">
          {result.avisos.map((aviso) => <p key={aviso}>{aviso}</p>)}
        </div>
      )}
    </article>
  );
}

export default function LoadingState({
  progress,
  results = [],
  isComplete = false,
  onNewImages,
}) {
  // indice da foto aberta na visualizacao ampliada; null = fechada
  const [previewIndex, setPreviewIndex] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [baixandoTodas, setBaixandoTodas] = useState(false);
  const previewRef = React.useRef(null);
  const isPreviewOpen = previewIndex !== null;
  const previewSource = isPreviewOpen ? results[previewIndex]?.image_data || exampleBoxes : null;

  useEffect(() => {
    if (!isPreviewOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setPreviewIndex(null);
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

  // Um download por foto, com um intervalo curto entre eles: disparar todos de
  // uma vez faz alguns navegadores ignorarem parte. Na primeira vez o navegador
  // pode pedir permissao para "baixar varios arquivos".
  const handleBaixarTodas = async () => {
    setBaixandoTodas(true);
    for (const item of results) {
      baixarImagem(item?.image_data || exampleBoxes, nomeDownload(item));
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
    setBaixandoTodas(false);
  };

  return (
    <div className={`flex flex-col items-center text-center animate-fade-in ${isComplete ? 'w-full' : ''}`}>
      {isComplete ? (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Identificação concluída</h2>
          <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
            {`Confira os resultados de ${results.length} ${results.length === 1 ? 'imagem' : 'imagens'}.`}
          </p>
          {/* Explicacao da triagem: uma vez so, valendo para todas as fotos */}
          <p className="mt-3 max-w-xl text-xs leading-relaxed text-gray-500">
            {results.some((item) => item?.saude_ativa === true)
              ? 'As caixas vermelhas marcam as plantas com suspeita de doença, com a probabilidade estimada pelo modelo (de 0 a 1). É uma triagem: confirme em campo antes de qualquer decisão.'
              : 'O modelo detecta a presença de agaves, mas a classificação de saúde está desligada no servidor.'}
          </p>
          {results.length > 1 && (
            <button
              type="button"
              onClick={handleBaixarTodas}
              disabled={baixandoTodas}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {baixandoTodas ? 'Baixando...' : `Baixar todas as fotos (${results.length})`}
            </button>
          )}

          {/* Lista das fotos, uma embaixo da outra; rola quando nao cabe na tela */}
          <div className="mt-6 mb-6 w-full max-h-[65vh] overflow-y-auto pr-1">
            {results.map((item, index) => (
              <ResultadoImagem
                key={`${item?.filename}-${index}`}
                result={item}
                index={index}
                total={results.length}
                onPreview={setPreviewIndex}
              />
            ))}
          </div>

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
        <>
          <div className="mb-6">
            <Loader2 className="w-10 h-10 text-gray-900 animate-spin" strokeWidth={2.2} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Analisando imagem...</h2>
          <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
            {`Processando imagem ${progress?.current || 1} de ${progress?.total || 1}. Cada imagem pode levar cerca de 13 segundos.`}
          </p>
        </>
      )}

      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Visualização da imagem identificada"
          onClick={() => setPreviewIndex(null)}
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
                onClick={() => setPreviewIndex(null)}
                className="rounded-full bg-white/90 p-2 text-gray-900 shadow transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                aria-label="Fechar visualização"
                title="Fechar"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <img
              src={previewSource}
              alt="Imagem identificada em tamanho ampliado"
              className="max-h-[85vh] w-auto max-w-full rounded-xl object-contain fullscreen:max-h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
