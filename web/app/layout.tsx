import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import '@/components/taste/taste-workspace.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });

export const metadata: Metadata = {
  icons: { icon: '/growthx-icon.svg', apple: '/growthx-icon.svg' },
  title: 'GrowthX — Your event team',
  description: 'The intelligence and taste layer for event creation and sponsorship.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={geist.variable}>{children}</body></html>;
}
