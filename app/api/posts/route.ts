import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts, createPost } from '@/lib/db';
import { fetchLivePrice } from '@/lib/prices';

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

    let precoEntrada: number | undefined;
    if (nivelAlvo) {
      try {
        const live = await fetchLivePrice(asset.toLowerCase());
        precoEntrada = live?.price;
      } catch (err) {
        console.error('[api/posts POST] falha ao capturar preço de entrada:', err);
      }
    }

    const post = await createPost({
      title,
      content,
      asset,
      tag,
      nivelAlvo,
      direcao,
      precoEntrada,
      imageUrl,
      videoUrl,
    });
    return NextResponse.json({ post });
  } catch (err) {
    console.error('[api/posts POST]', err);
    return NextResponse.json({ error: 'Erro ao publicar análise.' }, { status: 500 });
  }
}
