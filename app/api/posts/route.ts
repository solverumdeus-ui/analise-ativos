import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts, createPost } from '@/lib/db';

export async function GET() {
  try {
    const posts = await getAllPosts();
    return NextResponse.json({ posts });
  } catch (err) {
    console.error('[api/posts GET]', err);
    return NextResponse.json({ error: 'Erro ao buscar análises.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, title, content, asset, tag, nivelAlvo, direcao, imageUrl, videoUrl } = body;

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Servidor sem senha de administrador configurada.' },
        { status: 500 }
      );
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 });
    }

    if (!title || !content || !asset || !tag) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios.' }, { status: 400 });
    }

    const post = await createPost({ title, content, asset, tag, nivelAlvo, direcao, imageUrl, videoUrl });
    return NextResponse.json({ post });
  } catch (err) {
    console.error('[api/posts POST]', err);
    return NextResponse.json({ error: 'Erro ao publicar análise.' }, { status: 500 });
  }
}
