'use client';

import { useEffect, useState } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

// Deep-links straight to a provider's OAuth screen so an external app
// (Butterfly's Hermes agent) can send a user to "connect <platform>" without
// making them find the right button in the dashboard first.
export default function ConnectChannelPage() {
  const [message, setMessage] = useState('Opening sign-in...');
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    const provider = new URL(window.location.href).searchParams.get(
      'provider'
    );
    if (!provider || !/^[a-z0-9_-]+$/i.test(provider)) {
      setMessage('Missing or invalid platform.');
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/integrations/social/${encodeURIComponent(provider)}`,
          { credentials: 'include', headers: { Accept: 'application/json' } }
        );
        if (res.status === 401 || res.status === 403) {
          setNeedsLogin(true);
          setMessage('Sign in to Butterfly Social first, then try again.');
          return;
        }
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.url) {
          setMessage('Could not start the connection for this platform.');
          return;
        }
        window.location.href = data.url;
      } catch {
        setMessage('Could not reach Butterfly Social. Please try again.');
      }
    })();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-[16px]">{message}</p>
      {needsLogin && (
        <a href="/auth" className="underline">
          Go to sign in
        </a>
      )}
    </main>
  );
}
