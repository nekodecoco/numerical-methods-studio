import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Numerical Methods Studio',
  description:
    'Interactive educational visualizer for root-finding algorithms and polynomial approximations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#09090b] text-white min-h-screen antialiased selection:bg-[#800020] selection:text-white font-sans overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
