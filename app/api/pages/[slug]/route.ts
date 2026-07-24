import { NextRequest, NextResponse } from 'next/server';
import { getPage, upsertPage } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const page = await getPage(params.slug);
    return NextResponse.json({ page });
  } catch (err) {
    console.error('[api/pages GET]', err);
    return NextResponse.json({ error: 'Erro ao buscar página.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json();
    const { password, title, content, imageUrl } = body;

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

    const page = await upsertPage({ slug: params.slug, title, content, imageUrl });
    return NextResponse.json({ page });
  } catch (err) {
    console.error('[api/pages PATCH]', err);
    return NextResponse.json({ error: 'Erro ao salvar página.' }, { status: 500 });
  }
}
