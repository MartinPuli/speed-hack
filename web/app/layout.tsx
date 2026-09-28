import type { Metadata } from 'next';
import './globals.css';
import './experience.css';

export const metadata: Metadata = {
  title: 'Event GTM — Find your next room',
  description: 'Discover event opportunities and shape a gathering of your own.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
