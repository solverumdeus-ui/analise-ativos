'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeletePostButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm('Tem certeza que quer excluir essa análise? Essa ação não pode ser desfeita.')) {
      return;
    }

    const password = prompt('Digite a senha de administrador para confirmar:');
    if (!password) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${slug}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Erro ao excluir.');
        setIsDeleting(false);
        return;
      }

      router.push('/analises');
      router.refresh();
    } catch {
      alert('Erro de conexão. Tente novamente.');
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      style={{
        padding: '8px 16px',
        background: 'var(--surface)',
        color: 'var(--down)',
        border: '1px solid var(--border-strong)',
        borderRadius: 8,
        cursor: isDeleting ? 'not-allowed' : 'pointer',
        fontSize: 13,
        fontWeight: 600,
        marginLeft: 8,
      }}
    >
      {isDeleting ? 'Excluindo...' : '🗑 Excluir'}
    </button>
  );
}
