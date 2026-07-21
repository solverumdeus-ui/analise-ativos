import { NextRequest, NextResponse } from 'next/server';
import { getComments, createComment } from '@/lib/db';

export async function GET(req: NextRequest) {
  const postSlug = req.nextUrl.searchParams.get('postSlug');
  if (!postSlug) {
    return NextResponse.json({ error: 'postSlug é obrigatório.' }, { status: 400 });
  }
  try {
    const comments = await getComments(postSlug);
    return NextResponse.json({ comments });
  } catch (err) {
    console.error('[api/comments GET]', err);
    return NextResponse.json({ error: 'Erro ao buscar comentários.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { postSlug, name, message } = await req.json();

    if (!postSlug || !name || !message) {
      return NextResponse.json({ error: 'Preencha nome e mensagem.' }, { status: 400 });
    }
    if (name.length > 60 || message.length > 1000) {
      return NextResponse.json({ error: 'Texto muito longo.' }, { status: 400 });
    }

    const comment = await createComment({ postSlug, name, message });
    return NextResponse.json({ comment });
  } catch (err) {
    console.error('[api/comments POST]', err);
    return NextResponse.json({ error: 'Erro ao publicar comentário.' }, { status: 500 });
  }
}
