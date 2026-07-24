import { getPage } from '@/lib/db';
import PageEditor from '@/components/PageEditor';
import { remark } from 'remark';
import html from 'remark-html';

export const dynamic = 'force-dynamic';

const SLUG = 'metodo';

const DEFAULT_TITLE = 'Método';

const DEFAULT_CONTENT = `## Por que esse método existe

Antes de desenvolver isso, eu seguia sinal como todo mundo segue. O problema nunca foi falta de sinal — era excesso. Toda hora tinha um novo, de um lado ou de outro, e eu entrava.

E o padrão se repetia sempre igual: eu entrava, o preço ia contra. Eu esperava, perdia a paciência, saía — e quando as fichas acabavam, o preço ia exatamente pra onde eu tinha apostado.

Isso não é azar repetido. É sintoma de operar sem estrutura — reagindo a sinal, não a lógica de mercado. Foi isso que me fez parar de seguir indicador solto e ir estudar a fundo o **Smart Money Concepts (SMC)** — uma forma de ler o mercado que já existe há muitos anos, focada em entender onde a liquidez está concentrada e o que um grande player precisaria fazer pra conseguir entrar ou sair de uma posição sem se denunciar.

Não fui eu quem criou o SMC, e não é essa a pretensão aqui. O que eu fiz foi organizar um **sistema próprio de leitura e execução** em cima desses conceitos — uma sequência clara de etapas, com perguntas específicas em cada uma, que eu sigo sempre na mesma ordem. Isso é o que existe aqui: não um método novo do zero, mas um jeito estruturado, repetível e testável de aplicar o SMC na prática — algo que eu consigo explicar, testar, e errar de forma que eu aprenda com o erro, em vez de só repeti-lo.

## As três perguntas por trás de cada análise

Toda análise publicada aqui segue a mesma lógica interna, resumida em três perguntas que eu me faço antes de escrever qualquer coisa:

**Por que eu entrei?**
O gatilho técnico — o que exatamente no gráfico justificou prestar atenção naquele ativo, naquele momento.

**O que me motivou?**
O raciocínio por trás do gatilho. Não basta saber *o quê* aconteceu — importa entender *por que* aquele nível, aquela reação, aquele movimento tem peso.

**Como vou transmitir isso?**
A parte mais difícil, sinceramente. É fácil descrever um candle. É difícil explicar o comportamento por trás dele de um jeito que faça sentido pra quem está lendo, sem virar jargão vazio.

Se uma análise não passa por essas três perguntas, ela não é publicada.

## Meu sistema de leitura aplicando o SMC

O SMC (Smart Money Concepts) é a base teórica — os conceitos de estrutura, liquidez e comportamento institucional que uso vêm dele. O que eu desenvolvi foi a forma de aplicar isso na prática, num processo de 5 etapas, sempre nessa ordem:

**1. Contexto (1D)**
Identifico a estrutura principal do gráfico diário: marco os últimos rompimentos de estrutura (BOS) e a última mudança de caráter (CHOCH), se houver. A pergunta que guia essa etapa é simples: *quem está no controle agora — comprador ou vendedor?*

**2. Piscina de liquidez (4H)**
Aqui eu marco só o que importa: topos e fundos iguais (EQH/EQL), swing highs e swing lows, e as máximas/mínimas da semana e do dia anterior. Esses são, historicamente, os pontos onde costuma haver concentração real de ordens no mercado.

**3. Imbalance**
Depois de um movimento forte, procuro os desequilíbrios que ele deixou pra trás: FVG (Fair Value Gap), Order Blocks, e às vezes um Breaker.

**4. Alvo**
Essa é a etapa que muda tudo. A pergunta certa nunca é "pra onde o preço vai" — ninguém sabe isso. A pergunta é: *se eu fosse um algoritmo institucional, onde existe liquidez suficiente pra eu buscar?* O preço não "decide" ir a lugar nenhum — ele é empurrado até onde há ordens suficientes esperando.

**5. Confirmação (15m)**
Só depois de tudo isso, eu espero uma confirmação de verdade antes de considerar uma entrada: um sweep de liquidez, um CHOCH, um BOS, ou um reteste limpo num FVG ou Order Block. Sem confirmação, não existe entrada — só existe hipótese.

## A camada técnica: osciladores como confirmação, não como sinal

Além da estrutura, o método usa **divergência de RSI combinada com Price Action e SMC** — nunca RSI sozinho, e nunca como gatilho isolado. Um oscilador não prevê nada por conta própria; ele mede o ritmo do movimento. É a confluência entre estrutura, comportamento do preço e o que o oscilador está dizendo sobre a força do movimento que dá consistência à leitura — não qualquer um desses fatores isolado.

## Uma coisa que preciso deixar clara

Esse método reduz ruído. Ele não elimina incerteza — nenhum método elimina, e desconfie de quem promete isso. O que ele faz é trocar "seguir sinal e torcer" por um processo que eu consigo explicar antes da entrada, revisar depois dela, e melhorar com o tempo.

Cada análise publicada aqui é assinada, datada, e acompanhada de um replay honesto — inclusive quando erra. Esse é o compromisso: mostrar o raciocínio completo, não só o resultado quando dá certo.
`;

export default async function MetodoPage() {
  const page = await getPage(SLUG);

  const title = page?.title ?? DEFAULT_TITLE;
  const content = page?.content ?? DEFAULT_CONTENT;
  const imageUrl = page?.imageUrl ?? null;

  const processed = await remark().use(html).process(content);
  const contentHtml = processed.toString();

  return (
    <article>
      <div className="post-header">
        <h1>{title}</h1>
        <div style={{ marginTop: 14 }}>
          <PageEditor slug={SLUG} currentTitle={title} currentContent={content} currentImageUrl={imageUrl} />
        </div>
      </div>
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)', marginBottom: 20, marginTop: 20 }}
        />
      )}
      <div className="post-body" dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </article>
  );
}
