import { NextRequest, NextResponse } from 'next/server';
import { getAllSessionPosts, createSessionPost } from '@/lib/db';

export async function GET() {
  try {
    const posts = await getAllSessionPosts();
    return NextResponse.json({ posts });
  } catch (err) {
    console.error('[api/sessions GET]', err);
    return NextResponse.json({ error: 'Erro ao buscar posts.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
    if (!title || !content) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios.' }, { status: 400 });
    }

    const post = await createSessionPost({
      title,
      content,
      category: category ?? 'fora-do-grafico',
      imageUrl,
    });
    return NextResponse.json({ post });
  } catch (err) {
    console.error('[api/sessions POST]', err);
    return NextResponse.json({ error: 'Erro ao publicar.' }, { status: 500 });
  }
}
