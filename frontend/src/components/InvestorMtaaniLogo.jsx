import { useId } from "react";

export default function InvestorMtaaniLogo({ className = "", size = 40 }) {
  const id = useId().replaceAll(":", "");
  const plateId = `${id}-plate`;
  const edgeId = `${id}-edge`;
  const metalId = `${id}-metal`;
  const accentId = `${id}-accent`;
  const glowId = `${id}-glow`;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={plateId} x1="8" y1="4" x2="38" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1C4051" />
          <stop offset=".48" stopColor="#102538" />
          <stop offset="1" stopColor="#08131F" />
        </linearGradient>
        <linearGradient id={edgeId} x1="7" y1="6" x2="41" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C9FFF5" />
          <stop offset=".42" stopColor="#45DCC9" />
          <stop offset="1" stopColor="#789EF6" />
        </linearGradient>
        <linearGradient id={metalId} x1="13" y1="13" x2="36" y2="35" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F4FFFC" />
          <stop offset=".38" stopColor="#A6F2E6" />
          <stop offset=".72" stopColor="#52D9CB" />
          <stop offset="1" stopColor="#9DBBFF" />
        </linearGradient>
        <linearGradient id={accentId} x1="28" y1="24" x2="38" y2="13" gradientUnits="userSpaceOnUse">
          <stop stopColor="#46DDC9" />
          <stop offset="1" stopColor="#C8BCFF" />
        </linearGradient>
        <filter id={glowId} x="4" y="5" width="40" height="40" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>

      {/* A compact beveled shield keeps the mark legible as an app icon. */}
      <path d="M24 2.8 40.3 9v12.4c0 10.2-6.6 18.8-16.3 23.8C14.3 40.2 7.7 31.6 7.7 21.4V9L24 2.8Z" fill="#020812" opacity=".8" transform="translate(0 1.4)" />
      <path d="M24 2.8 40.3 9v12.4c0 10.2-6.6 18.8-16.3 23.8C14.3 40.2 7.7 31.6 7.7 21.4V9L24 2.8Z" fill={`url(#${plateId})`} />
      <path d="M24 3.4 39.7 9.4v12c0 9.8-6.3 17.9-15.7 22.7C14.6 39.3 8.3 31.2 8.3 21.4v-12L24 3.4Z" stroke={`url(#${edgeId})`} strokeOpacity=".78" strokeWidth="1.25" />
      <path d="M10 10.7 24 5.3l14 5.4" stroke="#E1FFF9" strokeOpacity=".22" strokeWidth=".8" strokeLinecap="round" />

      {/* Extruded dark edges sit below the bright metal faces. */}
      <path d="M13.3 16.4h5.2M15.9 16.4v16.2M13.3 32.6h5.2" transform="translate(0 1.4)" stroke="#031019" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 32.6V16.3l8.1 9.2 8.1-9.2v16.3" transform="translate(0 1.4)" stroke="#031019" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />

      <path d="M13.3 16.4h5.2M15.9 16.4v16.2M13.3 32.6h5.2" stroke={`url(#${metalId})`} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 32.6V16.3l8.1 9.2 8.1-9.2v16.3" stroke={`url(#${metalId})`} strokeWidth="3.65" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${glowId})`} opacity=".45" />
      <path d="M22 32.6V16.3l8.1 9.2 8.1-9.2v16.3" stroke={`url(#${metalId})`} strokeWidth="3.25" strokeLinecap="round" strokeLinejoin="round" />

      {/* One crisp rising signal turns the M into a growth cue. */}
      <path d="m29.7 23.8 4-3.1 3.5-5.3m-4.1.3h4.2v4.1" stroke={`url(#${accentId})`} strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="29.7" cy="23.8" r="1.25" fill="#D8FFF8" />
      <circle cx="37.2" cy="15.4" r="1.2" fill="#C9C0FF" />
    </svg>
  );
}
