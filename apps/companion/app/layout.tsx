import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TERP Companion',
  description: 'Search and view TERP documentation guides',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
