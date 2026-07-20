import Logo from '@/components/Logo';

export default function Sobre() {
  return (
    <article style={{ padding: '28px 0 40px', maxWidth: 640 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', paddingBottom: 28, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        <Logo size={56} />
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Solverum
          </p>
          <p className="mono" style={{ fontSize: 12, color: 'var(--accent)', margin: '4px 0 0' }}>
            Verum — verdade, mesmo quando é difícil de dizer.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', flex: 1 }}>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 4px' }}>estudando o mercado</p>
          <p className="mono" style={{ fontSize: 15, color: 'var(--text-primary)', margin: 0 }}>4 anos</p>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', flex: 1 }}>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 4px' }}>foco de análise</p>
          <p className="mono" style={{ fontSize: 15, color: 'var(--text-primary)', margin: 0 }}>BTC · XAU · XAG · XRP</p>
        </div>
      </div>

      <div style={{ color: 'var(--text-primary)', fontSize: 15, lineHeight: 1.75 }}>
        <p style={{ margin: '0 0 16px' }}>
          Comecei a estudar o mercado há 4 anos, do zero, como muita gente que
          está lendo isso agora. Esse espaço nasceu da vontade de compartilhar
          essa caminhada de um jeito honesto — sem fingir que toda análise vai
          acertar, sem vender certeza onde só existe probabilidade.
        </p>
        <p style={{ margin: '0 0 16px' }}>
          Aqui você encontra leituras sobre Bitcoin, ouro (XAU), prata (XAG) e
          XRP, escritas com o cuidado de quem estuda e erra e aprende junto,
          não de quem finge saber tudo. Cada análise é assinada e datada — se
          algo mudar de ideia depois, isso vai ser dito com a mesma
          transparência.
        </p>
        <p style={{ margin: '0 0 24px' }}>
          Se você também está no meio do processo de entender esse mercado,
          seja bem-vindo. A ideia é crescer nisso em boa companhia.
        </p>
      </div>

      <div style={{ background: 'var(--surface)', borderLeft: '2px solid var(--accent)', borderRadius: '0 8px 8px 0', padding: '12px 16px', marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          As análises aqui refletem interpretação pessoal e têm fins
          educacionais — não constituem recomendação de investimento.
        </p>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 16px' }} />
      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
        © {new Date().getFullYear()} Solverum. Todos os textos e análises
        publicados neste site são de autoria original de Solverum e
        protegidos por direitos autorais. A reprodução, cópia ou
        republicação total ou parcial deste conteúdo em outros sites, redes
        sociais ou veículos, sem autorização prévia e citação da fonte, não
        é permitida.
      </p>
    </article>
  );
}
