import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aniversário da Nicole | Confirmação de Presença',
  description: 'Confirme sua presença na festa de 8 anos da Nicole.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
