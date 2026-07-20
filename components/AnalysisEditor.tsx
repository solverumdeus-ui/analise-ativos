'use client';

import { useState } from 'react';

type Analysis = {
  id: string;
  title: string;
  content: string;
  asset: string;
  images: string[];
  videoUrl?: string;
  createdAt: string;
  author: string;
};

export default function AnalysisEditor({ onSubmit }: { onSubmit: (analysis: Analysis) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [asset, setAsset] = useState('BTC');
  const [author, setAuthor] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImages((prev) => [...prev, event.target.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const analysis: Analysis = {
      id: Date.now().toString(),
      title,
      content,
      asset,
      images,
      videoUrl: videoUrl || undefined,
      createdAt: new Date().toISOString(),
      author,
    };

    try {
      // Salvar no localStorage (para demo)
      const analyses = JSON.parse(localStorage.getItem('analyses') || '[]');
      analyses.push(analysis);
      localStorage.setItem('analyses', JSON.stringify(analyses));

      onSubmit(analysis);

      // Limpar formulário
      setTitle('');
      setContent('');
      setAsset('BTC');
      setAuthor('');
      setImages([]);
      setVideoUrl('');
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao salvar análise:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '12px 24px',
          background: 'var(--accent)',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500,
          marginBottom: 24,
        }}
      >
        + Criar Análise
      </button>
    );
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: 24,
      marginBottom: 32,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>Criar Nova Análise</h2>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 24,
            cursor: 'pointer',
            color: 'var(--text-secondary)',
          }}
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Nome do Autor */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
            Seu Nome
          </label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Ex: João Silva"
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--border)',
              borderRadius: 6,
              background: 'var(--background)',
              color: 'var(--text-primary)',
              fontSize: 14,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Título */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
            Título da Análise
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Análise Técnica do Bitcoin"
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--border)',
              borderRadius: 6,
              background: 'var(--background)',
              color: 'var(--text-primary)',
              fontSize: 14,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Ativo */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
            Ativo
          </label>
          <select
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--border)',
              borderRadius: 6,
              background: 'var(--background)',
              color: 'var(--text-primary)',
              fontSize: 14,
              boxSizing: 'border-box',
            }}
          >
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="XAU">Ouro (XAU)</option>
            <option value="XAG">Prata (XAG)</option>
            <option value="XRP">XRP</option>
          </select>
        </div>

        {/* Conteúdo */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
            Sua Análise
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escreva sua análise aqui..."
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid var(--border)',
              borderRadius: 6,
              background: 'var(--background)',
              color: 'var(--text-primary)',
              fontSize: 14,
              minHeight: 200,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Upload de Imagens */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
            Adicionar Prints/Imagens
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            style={{
              display: 'block',
              marginBottom: 8,
            }}
          />
          {images.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
              {images.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    borderRadius: 6,
                    overflow: 'hidden',
                    background: 'var(--border)',
                  }}
                >
                  <img
                    src={img}
                    alt={`preview-${idx}`}
                    style={{
                      width: '100%',
                      height: 100,
                      objectFit: 'cover',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* URL do Vídeo */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
            Link do Vídeo (YouTube, Vimeo, etc)
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Ex: https://youtube.com/watch?v=..."
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--border)',
              borderRadius: 6,
              background: 'var(--background)',
              color: 'var(--text-primary)',
              fontSize: 14,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Botões */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            style={{
              padding: '10px 20px',
              background: 'var(--border)',
              color: 'var(--text-primary)',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading || !title || !content || !author}
            style={{
              padding: '10px 20px',
              background: isLoading ? 'var(--border)' : 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {isLoading ? 'Salvando...' : 'Publicar Análise'}
          </button>
        </div>
      </form>
    </div>
  );
}
