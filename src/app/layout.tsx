import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'National Party Platform',
  description: 'Internal political party management system — constituencies, voting, meetings, events, and public engagement.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
