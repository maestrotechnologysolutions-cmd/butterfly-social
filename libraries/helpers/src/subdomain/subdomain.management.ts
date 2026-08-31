import { parse } from 'tldts';

export function getCookieUrlFromDomain(domain: string) {
  // allowPrivateDomains is required for correctness on hosting platforms
  // whose own subdomain (railway.app, vercel.app, github.io, etc.) is only
  // registered on the PRIVATE section of the Public Suffix List, not the
  // ICANN section that tldts consults by default. Without it, a deploy on
  // e.g. butterfly-social-production.up.railway.app parses as domain
  // "railway.app" (since only the ICANN-registered ".app" is recognized),
  // producing a cookie Domain=.railway.app that's shared with -- and
  // rejected/immediately invalidated by -- every other Railway-hosted app,
  // not just ours. Verified live: this broke session cookies end-to-end on
  // the platform's default *.up.railway.app domain (register succeeded,
  // but the very next authenticated request came back 401 with the cookie
  // cleared). With allowPrivateDomains, the exact platform subdomain is
  // recognized as its own private "domain", so the cookie is correctly
  // scoped to just this deployment's host. On a real custom domain (e.g.
  // app.example.com) behavior is unchanged from before.
  const url = parse(domain, { allowPrivateDomains: true });
  return url.domain! ? '.' + url.domain! : url.hostname!;
}
