'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ASSETS = [
  { value: 'BTC', label: 'Bitcoin (BTC)' },
  { value: 'XAU', label: 'Ouro (XAU)' },
  { value: 'XAG', label: 'Prata (XAG)' },
  { value: 'XRP', label: 'XRP' },
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--border)',
  borderRadius: 6,
  background: 'var(--bg)',
  color: 'var(--text-primary)',
  fontSize: 14,
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  color: 'var(--text-secondary)',
  marginBottom: 6,
};

export default function AnalysisEditor({ onPublished }: { onPublished?: () => void }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [asset, setAsset] = useState('BTC');
  const [tag, setTag] = useState('análise técnica');
  const [nivelAlvo, setNivelAlvo] = useState('');
  const [direcao, setDirecao] = useState<'alta' | 'baixa'>('alta');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          title,
          content,
          asset,
          tag,
          nivelAlvo: nivelAlvo ? Number(nivelAlvo) : undefined,
          direcao: nivelAlvo ? direcao : undefined,
          imageUrl: imageUrl || undefined,
          videoUrl: videoUrl || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao publicar.');
        return;
      }

      setTitle('');
      setContent('');
      setNivelAlvo('');
      setImageUrl('');
      setVideoUrl('');
      setIsOpen(false);
      router.refresh();
      onPublished?.();
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '10px 20px',
          background: 'var(--accent)',
          color: '#0b0e11',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 24,
        }}
      >
        + Publicar nova análise
      </button>
    );
  }

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 24,
        marginBottom: 32,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontFamily: 'var(--font-display)' }}>Publicar nova análise</h2>
        <button
          onClick={() => setIsOpen(false)}
          style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-secondary)' }}
          aria-label="Fechar"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Senha de administrador</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Título da análise</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: BTC testa suporte dos 100 mil"
            required
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Ativo</label>
            <select value={asset} onChange={(e) => setAsset(e.target.value)} style={inputStyle}>
              {ASSETS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Tipo de análise</label>
            <input type="text" value={tag} onChange={(e) => setTag(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Texto da análise (aceita Markdown)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escreva sua análise aqui..."
            required
            style={{ ...inputStyle, minHeight: 180, fontFamily: 'inherit', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Nível-alvo (opcional, ativa o replay)</label>
            <input
              type="number"
              value={nivelAlvo}
              onChange={(e) => setNivelAlvo(e.target.value)}
              placeholder="Ex: 112000"
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Direção</label>
            <select
              value={direcao}
              onChange={(e) => setDirecao(e.target.value as 'alta' | 'baixa')}
              disabled={!nivelAlvo}
              style={{ ...inputStyle, opacity: nivelAlvo ? 1 : 0.5 }}
            >
              <option value="alta">Alta</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Link de imagem (opcional)</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Link de vídeo (opcional)</label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            style={inputStyle}
          />
        </div>

        {error && (
          <p style={{ color: 'var(--down)', fontSize: 13, marginBottom: 16 }}>{error}</p>
        )}

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
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              background: isLoading ? 'var(--border)' : 'var(--accent)',
              color: '#0b0e11',
              border: 'none',
              borderRadius: 6,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {isLoading ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </form>
    </div>
  );
}
