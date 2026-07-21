import { NextRequest, NextResponse } from 'next/server';
import { updatePost } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
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

    const post = await updatePost(params.slug, {
      title,
      content,
      asset,
      tag,
      nivelAlvo: nivelAlvo === '' ? null : nivelAlvo,
      direcao: nivelAlvo ? direcao : null,
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
    });

    if (!post) {
      return NextResponse.json({ error: 'Análise não encontrada.' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (err) {
    console.error('[api/posts/[slug] PATCH]', err);
    return NextResponse.json({ error: 'Erro ao salvar alterações.' }, { status: 500 });
  }
}
