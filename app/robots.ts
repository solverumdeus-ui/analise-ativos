import type { MetadataRoute } from 'next';

// Fallback aponta pro domínio atual da Vercel. No dia que você comprar um
// domínio próprio, é só configurar NEXT_PUBLIC_SITE_URL no painel da
// Vercel (Settings → Environment Variables) com o novo domínio — nada
// de código muda.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://analise-ativos.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // A área de edição/criação de análises não deve ser indexada —
      // não é conteúdo pro público em geral, e evita expor rotas
      // administrativas nos resultados de busca.
      disallow: ['/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
