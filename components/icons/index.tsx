// Custom lightweight icons to replace Font Awesome
// These are minimal SVG components that match your current icons

interface IconProps {
  className?: string;
  size?: number;
}

export const MicrophoneIcon = ({ className = "w-4 h-4", size }: IconProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
  </svg>
);

export const FileTextIcon = ({ className = "w-4 h-4", size }: IconProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
    <path d="M14 2v6h6M16 13H8m8 2H8m8 2H8" />
  </svg>
);

export const UsersIcon = ({ className = "w-4 h-4", size }: IconProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <path d="M20 8v6M23 11l-3 3-3-3" />
  </svg>
);

export const ArrowRightIcon = ({ className = "w-4 h-4", size }: IconProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M5 12h14m-7-7 7 7-7 7" />
  </svg>
);

export const CheckIcon = ({ className = "w-4 h-4", size }: IconProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const GitHubIcon = ({ className = "w-4 h-4", size }: IconProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);
