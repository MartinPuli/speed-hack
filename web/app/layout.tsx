import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Event GTM — Research workspace',
  description: 'Explore events and their evidence. Prepare your next go-to-market move.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
