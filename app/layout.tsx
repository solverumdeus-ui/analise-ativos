import './globals.css';
import Link from 'next/link';
import Ticker from '@/components/Ticker';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import { getAssets } from '@/lib/assets';

export const metadata = {
  title: 'Tese de Mercado — análises de BTC, XAU, XAG, XRP',
  description: 'Análises de mercado por Solverum: Bitcoin, ouro, prata e XRP.',
};

export const revalidate = 300; // atualiza os preços a cada 5 minutos

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const assets = await getAssets();

  return (
    <html lang="pt-BR">
      <body>
        <Ticker assets={assets} />
        <div className="container">
          <header className="site-header">
            <Link href="/" className="brand">
              <Logo size={28} />
              <span>Tese de Mercado</span>
            </Link>
            <nav>
              <Link href="/">ativos</Link>
              <Link href="/">análises</Link>
              <Link href="/sobre">sobre</Link>
            </nav>
          </header>
        </div>
        <main className="container">{children}</main>
        <div className="container">
          <Footer /> {new Date().getFullYear()} — análises publicadas para fins educacionais, não são recomendação de investimento.</footer>
        </div>
      </body>
    </html>
  );
}
