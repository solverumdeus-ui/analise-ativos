'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteSessionPostButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const password = window.prompt('Senha de administrador:');
    if (!password) return;
    if (!window.confirm('Tem certeza que quer excluir este post? Essa ação não pode ser desfeita.')) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/sessions/${slug}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao excluir.');
        return;
      }
      router.push('/sessoes');
      router.refresh();
    } catch {
      alert('Erro de conexão. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      style={{
        padding: '8px 16px',
        marginLeft: 8,
        background: 'transparent',
        color: 'var(--down)',
        border: '1px solid var(--down)',
        borderRadius: 8,
        cursor: isDeleting ? 'not-allowed' : 'pointer',
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {isDeleting ? 'Excluindo...' : '✕ Excluir'}
    </button>
  );
}
