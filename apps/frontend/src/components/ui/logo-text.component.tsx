import React from 'react';

export const LogoTextComponent = () => {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        color: 'currentColor',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-mark.png"
        alt="Butterfly Social"
        width={28}
        height={28}
        style={{ display: 'block' }}
      />
      <span
        style={{
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          whiteSpace: 'nowrap',
        }}
      >
        Butterfly Social
      </span>
    </span>
  );
};
