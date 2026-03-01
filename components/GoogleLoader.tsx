import React from "react";

/**
 * Google-style four-color bouncing dots loader.
 * Uses the official Google brand colors: Blue, Red, Yellow, Green.
 */

interface GoogleLoaderProps {
  /** Size of each dot in pixels (default: 12) */
  size?: number;
  /** Optional message below the loader */
  message?: string;
  /** Whether to render as a full-page centered loader */
  fullPage?: boolean;
  /** Additional CSS classes for the wrapper */
  className?: string;
}

export default function GoogleLoader({
  size = 12,
  message,
  fullPage = false,
  className = "",
}: GoogleLoaderProps) {
  const colors = ["#4285F4", "#EA4335", "#FBBC05", "#34A853"]; // Google Blue, Red, Yellow, Green
  const gap = size * 0.75;

  const wrapper = fullPage
    ? "flex flex-col items-center justify-center min-h-screen w-full"
    : "flex flex-col items-center justify-center py-20 w-full";

  return (
    <div className={`${wrapper} ${className}`}>
      <div className="google-loader" style={{ display: "flex", gap, alignItems: "center", height: size * 3 }}>
        {colors.map((color, i) => (
          <div
            key={i}
            className="google-loader-dot"
            style={{
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: color,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
      {message && (
        <p className="mt-4 text-sm text-muted-foreground font-medium">{message}</p>
      )}
    </div>
  );
}
