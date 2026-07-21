'use client';

import { useEffect, useState } from 'react';

type Comment = {
  id: number;
  name: string;
  message: string;
  createdAt: string;
};

export default function Comments({ postSlug }: { postSlug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      const res = await fetch(`/api/comments?postSlug=${encodeURIComponent(postSlug)}`);
      const data = await res.json();
      setComments(data.comments ?? []);
    } catch {
      // silencioso — comentários não são críticos pra leitura da página
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postSlug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postSlug, name, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao comentar.');
        return;
      }
      setName('');
      setMessage('');
      await load();
    } catch {
      setError('Erro de conexão.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ marginTop: 40, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
      <p className="section-label">comentários {comments.length > 0 && `(${comments.length})`}</p>

      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Carregando...</p>
      ) : comments.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
          Nenhum comentário ainda — seja o primeiro.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {comments.map((c) => (
            <div key={c.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <p style={{ fontSize: 14, margin: 0, lineHeight: 1.6 }}>{c.message}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome"
          required
          maxLength={60}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--border)',
            borderRadius: 6,
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            fontSize: 13,
          }}
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Deixe seu comentário..."
          required
          maxLength={1000}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--border)',
            borderRadius: 6,
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            fontSize: 13,
            minHeight: 70,
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />
        {error && <p style={{ color: 'var(--down)', fontSize: 12, margin: 0 }}>{error}</p>}
        <button
          type="submit"
          disabled={sending}
          style={{
            alignSelf: 'flex-start',
            padding: '8px 16px',
            background: 'var(--accent)',
            color: '#0b0e11',
            border: 'none',
            borderRadius: 6,
            cursor: sending ? 'not-allowed' : 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {sending ? 'Enviando...' : 'Comentar'}
        </button>
      </form>
    </div>
  );
}
