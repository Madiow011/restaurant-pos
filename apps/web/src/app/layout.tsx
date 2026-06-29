import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Restaurant POS',
  description: 'Production-Ready Restaurant Point of Sale System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className="h-full">
      <body className="h-full bg-slate-900 antialiased">{children}</body>
    </html>
  );
}
