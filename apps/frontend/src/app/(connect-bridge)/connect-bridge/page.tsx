'use client';

import { useEffect, useMemo, useState } from 'react';

// Backend is reached same-origin through nginx's /api/ proxy in the single
// container deploy (see var/docker/nginx.conf) — NEXT_PUBLIC_BACKEND_URL is
// baked in at build time to point at that path, exactly like the rest of
// the frontend app (login.tsx / register.tsx use the same env var via
// useFetch()). This page intentionally talks to the backend directly with
// fetch + credentials:'include' rather than pulling in the app's full
// FetchWrapperComponent context, since it's a minimal standalone route.
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

// Only postMessage the API key to an origin Butterfly itself configured for
// this deployment. Sourced from a public env var so it can be set per
// environment (local dev origin, preview origin, production origin) without
// a code change.
const ALLOWED_ORIGINS = (process.env.NEXT_PUBLIC_BUTTERFLY_ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

type Mode = 'login' | 'register';
type Status = 'form' | 'submitting' | 'success' | 'error';

function isAllowedOrigin(origin: string) {
  return ALLOWED_ORIGINS.includes(origin);
}

export default function ConnectBridgePage() {
  const [mode, setMode] = useState<Mode>('register');
  const [status, setStatus] = useState<Status>('form');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [copied, setCopied] = useState(false);

  const params = useMemo(() => {
    if (typeof window === 'undefined') return { origin: '', state: '' };
    const url = new URL(window.location.href);
    return {
      origin: url.searchParams.get('origin') || '',
      state: url.searchParams.get('state') || '',
    };
  }, []);

  const callerOriginValid = !!params.origin && isAllowedOrigin(params.origin);

  async function completeWithApiKey() {
    const selfRes = await fetch(`${BACKEND_URL}/user/self`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!selfRes.ok) {
      throw new Error('Could not load your account details after signing in.');
    }
    const self = await selfRes.json();
    const apiKey = self?.publicApi;
    if (!apiKey) {
      throw new Error(
        'Your account has no API key yet. Please contact support.'
      );
    }
    if (!callerOriginValid || typeof window === 'undefined' || !window.opener) {
      // Nowhere to post the key to (unrecognized referrer, direct visit, or a
      // browser that dropped the opener). Show it so the user can paste it
      // into the app manually instead of losing it.
      setManualKey(apiKey);
      setStatus('success');
      return;
    }
    window.opener?.postMessage(
      {
        source: 'butterfly-social-connect',
        state: params.state,
        apiKey,
        baseUrl: window.location.origin,
      },
      params.origin
    );
    setStatus('success');
    window.close();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setError('');
    try {
      const body =
        mode === 'register'
          ? { email, password, provider: 'LOCAL', company }
          : { email, password, provider: 'LOCAL' };
      const res = await fetch(`${BACKEND_URL}/auth/${mode}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status !== 200) {
        const message = await res.text();
        setError(message || 'Something went wrong. Please try again.');
        setStatus('form');
        return;
      }
      if (res.headers.get('activate') === 'true') {
        setError(
          'This instance requires email activation before you can connect. Please activate your account first, then try connecting again.'
        );
        setStatus('form');
        return;
      }
      await completeWithApiKey();
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
      setStatus('form');
    }
  }

  // If the user already has a valid session (e.g. reopening the popup after
  // a previous successful connect), skip the form entirely.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/user/self`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
        if (!cancelled && res.ok) {
          const self = await res.json();
          if (self?.id) {
            await completeWithApiKey();
          }
        }
      } catch {
        // ignore — fall through to showing the form
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center">
        <div className="w-full max-w-[380px]">
          <h1 className="text-[24px] font-[600] mb-[8px]">Connected</h1>
          {manualKey ? (
            <>
              <p className="text-[14px] opacity-70 mb-[12px]">
                This is your Butterfly Social API key. Copy it and paste it in
                your app under Connections &rarr; Butterfly Social.
              </p>
              <code className="block break-all rounded-[8px] border px-[12px] py-[10px] text-[13px] text-left select-all">
                {manualKey}
              </code>
              <button
                type="button"
                className="mt-[12px] w-full rounded-[8px] px-[12px] py-[10px] bg-white text-black font-[600]"
                onClick={() => {
                  navigator.clipboard?.writeText(manualKey).then(
                    () => setCopied(true),
                    () => {}
                  );
                }}
              >
                {copied ? 'Copied' : 'Copy key'}
              </button>
            </>
          ) : (
            <p className="text-[14px] opacity-70">
              You can close this window now.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-[380px]">
        <h1 className="text-[28px] font-[600] mb-[4px]">Butterfly Social</h1>
        <p className="text-[14px] opacity-70 mb-[24px]">
          {mode === 'register'
            ? 'Create your Butterfly Social account to connect it.'
            : 'Sign in to your Butterfly Social account to connect it.'}
        </p>
        {!callerOriginValid && (
          <p className="text-[13px] mb-[16px] text-red-400">
            This page was not opened from a recognized app. You can still sign
            in, but the API key will not be sent anywhere automatically.
          </p>
        )}
        <form className="flex flex-col gap-[12px]" onSubmit={onSubmit}>
          {mode === 'register' && (
            <input
              className="border rounded-[8px] px-[12px] py-[10px] bg-transparent"
              placeholder="Company / team name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
          )}
          <input
            className="border rounded-[8px] px-[12px] py-[10px] bg-transparent"
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="border rounded-[8px] px-[12px] py-[10px] bg-transparent"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={3}
          />
          {error && <p className="text-[13px] text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="rounded-[8px] px-[12px] py-[10px] bg-white text-black font-[600] disabled:opacity-60"
          >
            {status === 'submitting'
              ? 'Please wait...'
              : mode === 'register'
              ? 'Create account & connect'
              : 'Sign in & connect'}
          </button>
        </form>
        <button
          type="button"
          className="mt-[16px] text-[13px] underline opacity-70"
          onClick={() => {
            setMode(mode === 'register' ? 'login' : 'register');
            setError('');
          }}
        >
          {mode === 'register'
            ? 'Already have an account? Sign in instead'
            : "Don't have an account? Register instead"}
        </button>
      </div>
    </div>
  );
}
