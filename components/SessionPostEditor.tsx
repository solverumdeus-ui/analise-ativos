'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Só "fora-do-grafico" está ativa por enquanto — quando "Base" entrar,
// é só descomentar a linha abaixo, nada mais muda no resto do componente.
const CATEGORIES = [
  { value: 'fora-do-grafico', label: 'Fora do Gráfico' },
  // { value: 'base', label: 'Base' },
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

type ExistingPost = {
  slug: string;
  title: string;
  content: string;
  category: string;
  imageUrl: string | null;
};

type Props = {
  editPost?: ExistingPost;
  triggerLabel?: string;
};

export default function SessionPostEditor({ editPost, triggerLabel }: Props) {
  const router = useRouter();
  const isEditMode = !!editPost;

  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState(editPost?.title ?? '');
  const [content, setContent] = useState(editPost?.content ?? '');
  const [category, setCategory] = useState(editPost?.category ?? 'fora-do-grafico');
  const [imageUrl, setImageUrl] = useState(editPost?.imageUrl ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const payload = { password, title, content, category, imageUrl: imageUrl || undefined };

    try {
      const res = await fetch(
        isEditMode ? `/api/sessions/${editPost!.slug}` : '/api/sessions',
        {
          method: isEditMode ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao salvar.');
        return;
      }

      if (!isEditMode) {
        setTitle('');
        setContent('');
        setImageUrl('');
      }
      setIsOpen(false);
      router.refresh();
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
          padding: isEditMode ? '8px 16px' : '10px 20px',
          background: isEditMode ? 'var(--surface)' : 'var(--accent)',
          color: isEditMode ? 'var(--text-primary)' : '#0b0e11',
          border: isEditMode ? '1px solid var(--border-strong)' : 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
          marginBottom: isEditMode ? 0 : 24,
        }}
      >
        {triggerLabel ?? (isEditMode ? '✎ Editar' : '+ Publicar em Entre Sessões')}
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
        <h2 style={{ margin: 0, fontSize: 18, fontFamily: 'var(--font-display)' }}>
          {isEditMode ? 'Editar post' : 'Publicar em Entre Sessões'}
        </h2>
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
          <label style={labelStyle}>Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Categoria</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Texto (aceita Markdown, incluindo imagens no meio)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            style={{ ...inputStyle, minHeight: 220, fontFamily: 'inherit', resize: 'vertical' }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Imagem de capa (opcional)</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            style={inputStyle}
          />
        </div>

        {error && <p style={{ color: 'var(--down)', fontSize: 13, marginBottom: 16 }}>{error}</p>}

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
            {isLoading ? 'Salvando...' : isEditMode ? 'Salvar alterações' : 'Publicar'}
          </button>
        </div>
      </form>
    </div>
  );
}
