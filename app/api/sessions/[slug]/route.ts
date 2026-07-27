import { NextRequest, NextResponse } from 'next/server';
import { updateSessionPost, deleteSessionPost } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json();
    const { password, title, content, category, imageUrl } = body;

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Servidor sem senha de administrador configurada.' },
        { status: 500 }
      );
    }
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 });
    }

    const post = await updateSessionPost(params.slug, { title, content, category, imageUrl });
    if (!post) return NextResponse.json({ error: 'Post não encontrado.' }, { status: 404 });
    return NextResponse.json({ post });
  } catch (err) {
    console.error('[api/sessions PATCH]', err);
    return NextResponse.json({ error: 'Erro ao salvar.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Servidor sem senha de administrador configurada.' },
        { status: 500 }
      );
    }
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 });
    }

    const deleted = await deleteSessionPost(params.slug);
    if (!deleted) return NextResponse.json({ error: 'Post não encontrado.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/sessions DELETE]', err);
    return NextResponse.json({ error: 'Erro ao excluir.' }, { status: 500 });
  }
}
