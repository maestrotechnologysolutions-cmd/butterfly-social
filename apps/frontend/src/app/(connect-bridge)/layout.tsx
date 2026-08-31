export const dynamic = 'force-dynamic';
import '../global.scss';
import { ReactNode } from 'react';

// Minimal, standalone layout for the popup-based connect flow. Deliberately
// does not pull in the full app chrome, sidebar, or the app's context
// providers (VariableContextComponent / FetchWrapperComponent) — this route
// is a small self-contained bridge meant to be opened in a popup window by
// an external app (Butterfly), not part of the normal dashboard experience.
export default function ConnectBridgeLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="dark text-primary !bg-primary">{children}</body>
    </html>
  );
}
