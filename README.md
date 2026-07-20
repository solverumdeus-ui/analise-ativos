# Site de análises de ativos (BTC, XAU, XAG, XRP)

Site em Next.js, já funcionando, com:
- Faixa de cotações no topo (dado de exemplo — trocar por API depois)
- Cards de preço dos 4 ativos
- Lista de análises (posts em Markdown)
- Página individual para cada análise

## Como postar uma nova análise

1. Vá em `content/posts/`
2. Copie um dos arquivos `.md` existentes como modelo
3. Crie um novo arquivo, ex: `content/posts/prata-suporte-30.md`
4. Preencha o topo (front matter) e o texto:

```
---
title: "Título da sua análise"
date: "2026-07-20"
asset: "XAG"
tag: "análise técnica"
---

Texto da análise aqui, em Markdown normal.

## Um subtítulo, se quiser

Mais texto.
```

5. Salve, suba pro GitHub — o site atualiza sozinho.

## Como colocar o site no ar (passo a passo)

1. Crie uma conta gratuita em https://github.com (se ainda não tiver)
2. Crie um repositório novo (ex: `analise-ativos`)
3. Suba esta pasta para o repositório (pelo site do GitHub, arrastando os arquivos, ou via `git`)
4. Crie uma conta gratuita em https://vercel.com (pode entrar direto com sua conta do GitHub)
5. Em "Add New Project", selecione o repositório que você acabou de subir
6. Clique em Deploy — não precisa mexer em nenhuma configuração

Em 1-2 minutos seu site estará no ar em um endereço tipo:
`https://analise-ativos-seunome.vercel.app`

Esse já é o seu domínio gratuito. Depois, se quiser, dá pra comprar um domínio próprio (ex: `seunome.com`) e apontar pra esse mesmo projeto na Vercel, sem precisar mudar nada no código.

## Rodando localmente (opcional, para ver antes de publicar)

```
npm install
npm run dev
```

Depois abra http://localhost:3000 no navegador.

## Próximo passo natural

As cotações em `lib/assets.ts` hoje são fixas (mock). Quando você decidir a API de preços (ex: CoinGecko para BTC/XRP, uma API de metais para XAU/XAG), é só trocar essa função por uma chamada real — o resto do site já está pronto para receber isso sem mudanças.
