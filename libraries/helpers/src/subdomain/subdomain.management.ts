import { parse } from 'tldts';

// Hosting-platform suffixes whose subdomains (e.g. *.up.railway.app,
// *.vercel.app) are NOT resolvable via tldts's Public Suffix List lookup as
// distinct "private" registrable domains -- verified empirically against
// the pinned tldts@6.1.86: parsing
// "butterfly-social-production.up.railway.app" returns publicSuffix "app",
// isIcann true, isPrivate false, domain "railway.app" -- i.e. tldts's
// compiled PSL data does NOT list up.railway.app on the private section at
// all in this version, so `{ allowPrivateDomains: true }` has no effect
// here. Falling back to plain PSL parsing for these hosts produces a
// cookie Domain=.railway.app shared with -- and immediately
// rejected/invalidated by -- every other Railway-hosted app, not just ours.
// Verified live: this broke session cookies end-to-end on the platform's
// default *.up.railway.app domain (register succeeded, but the very next
// authenticated request came back 401 with the cookie cleared).
const PLATFORM_SUBDOMAIN_SUFFIXES = [
  '.up.railway.app',
  '.vercel.app',
  '.netlify.app',
  '.github.io',
  '.fly.dev',
  '.onrender.com',
];

export function getCookieUrlFromDomain(domain: string) {
  const url = parse(domain, { allowPrivateDomains: true });
  const hostname = url.hostname!;

  if (PLATFORM_SUBDOMAIN_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
    // Use the exact host, no leading dot: this scopes the cookie to just
    // this one deployment instead of tldts's (wrong, for these hosts)
    // registered-domain guess.
    return hostname;
  }

  return url.domain! ? '.' + url.domain! : hostname;
}
