'use client';

export const Logo = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="60"
      height="60"
      viewBox="0 0 60 60"
      fill="none"
      className="mt-[8px] min-w-[60px] min-h-[60px]"
    >
      {/* Body */}
      <path
        d="M30 16C31.1 16 32 16.9 32 18V44C32 45.1 31.1 46 30 46C28.9 46 28 45.1 28 44V18C28 16.9 28.9 16 30 16Z"
        fill="#1A1A1A"
      />
      {/* Antennae */}
      <path
        d="M28.5 17L24 11"
        stroke="#1A1A1A"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M31.5 17L36 11"
        stroke="#1A1A1A"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="23.4" cy="10" r="1.6" fill="#EE4266" />
      <circle cx="36.6" cy="10" r="1.6" fill="#2FA8A0" />

      {/* Upper wings (primary coral) */}
      <path
        d="M29 21C22 12 10 12 6.5 19C3.5 25 6 32 14 34C20.5 35.6 27 30 29 24V21Z"
        fill="#EE4266"
      />
      <path
        d="M31 21C38 12 50 12 53.5 19C56.5 25 54 32 46 34C39.5 35.6 33 30 31 24V21Z"
        fill="#EE4266"
      />

      {/* Lower wings (secondary teal) */}
      <path
        d="M29 27C24.5 24 16 24 12 29C8.5 33.5 9.5 40 16 42.5C21 44.5 27 41 29 35.5V27Z"
        fill="#2FA8A0"
      />
      <path
        d="M31 27C35.5 24 44 24 48 29C51.5 33.5 50.5 40 44 42.5C39 44.5 33 41 31 35.5V27Z"
        fill="#2FA8A0"
      />
    </svg>
  );
};
