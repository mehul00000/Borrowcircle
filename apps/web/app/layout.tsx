import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { AppProvider } from '@/components/AppContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'BorrowCircle — Why buy when you can borrow?',
  description: 'Discover useful things around you. Borrow from your neighbours, share what you own, and make more out of less.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Server component: read env here (cannot import from a 'use client' module).
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
  const content = <AppProvider>{children}</AppProvider>;
  return (
    <html lang="en">
      <body>{clerkPublishableKey ? <ClerkProvider publishableKey={clerkPublishableKey}>{content}</ClerkProvider> : content}</body>
    </html>
  );
}
