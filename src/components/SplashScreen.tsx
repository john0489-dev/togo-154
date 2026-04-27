import { AppLogo } from "./AppLogo";

interface SplashScreenProps {
  /** When true, plays the fade-out animation before being unmounted by the parent. */
  fadingOut?: boolean;
}

export function SplashScreen({ fadingOut = false }: SplashScreenProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#f5f0e8",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        zIndex: 9999,
        animation: fadingOut
          ? "splashFadeOut 0.3s ease-out forwards"
          : "splashFadeIn 0.3s ease-out",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: "#f5f0e8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AppLogo size={72} />
      </div>
      <h1
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 28,
          fontWeight: 400,
          color: "#1a1a18",
          letterSpacing: "-0.02em",
          margin: 0,
          lineHeight: 1,
        }}
      >
        To Go
      </h1>
    </div>
  );
}
