import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Taylor Series Visualizer | Numerical Methods',
  description:
    'An interactive educational visualizer for Taylor polynomial series approximations, designed for Numerical Methods classes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#FAF9F6] text-stone-900 min-h-screen antialiased selection:bg-[#800020] selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
