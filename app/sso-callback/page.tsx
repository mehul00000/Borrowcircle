'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Handles the OAuth redirect back from Google: Clerk completes the session,
// then we continue to the dashboard.
export default function SsoCallbackPage() {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => {
      router.push('/dashboard');
    }, 8000);
    return () => clearTimeout(t);
  }, [router]);
  return <AuthenticateWithRedirectCallback />;
}
