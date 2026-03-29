import type { Metadata } from "next";
import { Rajdhani } from "next/font/google";
import "./globals.css";
import AudioEngine from "@/components/global/AudioEngine";
import WarpBackground from "@/components/global/WarpBackground";
import SpaceWarpNoSSR from "@/components/global/SpaceWarpNoSSR";
import StickyPlayer from "@/components/ui/StickyPlayer";
import SpaceThemeWrapper from "@/components/global/SpaceThemeWrapper";
import WrldChanger from "@/components/global/WrldChanger";
import AgeVerificationModal from "@/components/global/AgeVerificationModal";
import AuthEngine from "@/components/global/AuthEngine";
import NavigationHUD from "@/components/global/NavigationHUD";
import AirdropModal from "@/components/global/AirdropModal";

const raj = Rajdhani({
  variable: "--font-rajdhani",
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
});

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover' as const,
};

export const metadata: Metadata = {
  title: "SpaceJamz Studio V3B | THE ARCHITECT",
  description: "Neural Interface and Audio Delivery Engine",
  appleWebApp: {
    title: 'SpaceJamz',
    statusBarStyle: 'black-translucent',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${raj.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col bg-black text-white overflow-hidden p-0 m-0">
          
          <AuthEngine />
          <AgeVerificationModal />
          <AirdropModal />
          <SpaceThemeWrapper>
            {/* BACKGROUND AUDIO-VISUAL PHYSICS ENGINE */}
            <AudioEngine />
            
            {/* PROCEDURAL SPACE WARP ENGINE (SSR Isolated) */}
            <SpaceWarpNoSSR />
            
            <WarpBackground />
            
            {/* PHASE 3: THE HIGH-TECH INTERFACE BORDER */}
            <div className="interface-border-wrapper">
                <div className="interface-border-glow-top" />
                <div className="interface-border-glow-bottom" />
                
                {/* TACTICAL HUD OVERLAY (Fixed Corners) */}
                <div className="absolute inset-0 pointer-events-none z-[100] flex flex-col justify-between p-4 mix-blend-screen opacity-60">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                            <span className="font-mono text-[7px] text-primary tracking-[0.4em] uppercase font-black">Sys_Sector: 01</span>
                            <div className="w-12 h-0.5 bg-primary/40" />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="font-mono text-[7px] text-primary tracking-[0.4em] uppercase font-black">LATENCY: 12ms</span>
                            <div className="w-12 h-0.5 bg-primary/40" />
                        </div>
                    </div>
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-1">
                            <div className="w-12 h-0.5 bg-primary/40" />
                            <span className="font-mono text-[7px] text-primary tracking-[0.4em] uppercase font-black">FOUNDRY_INIT: OK</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="w-12 h-0.5 bg-primary/40" />
                            <span className="font-mono text-[7px] text-primary tracking-[0.4em] uppercase font-black">TREASURY: SECURE</span>
                        </div>
                    </div>
                </div>

                {/* DYNAMIC SENSORIAL BORDERS (Triple-A Gaming Aesthetics) */}
                <div className="absolute inset-x-0 top-0 h-[var(--border-thickness,2px)] bg-gradient-to-r from-transparent via-primary to-transparent z-[1000] opacity-[var(--border-opacity,0.6)] animate-pulse" />
                <div className="absolute inset-x-0 bottom-0 h-[var(--border-thickness,2px)] bg-gradient-to-r from-transparent via-primary to-transparent z-[1000] opacity-[var(--border-opacity,0.6)] animate-pulse" />
                <div className="absolute inset-y-0 left-0 w-[var(--border-thickness,2px)] bg-gradient-to-b from-transparent via-primary to-transparent z-[1000] opacity-[var(--border-opacity,0.6)]" />
                <div className="absolute inset-y-0 right-0 w-[var(--border-thickness,2px)] bg-gradient-to-b from-transparent via-primary to-transparent z-[1000] opacity-[var(--border-opacity,0.6)]" />

                {/* INNER SCROLLABLE / INTERACTIVE REALM */}
                <div className="audio-filter-target interface-interactive flex-1 flex flex-col z-[50] relative overflow-y-auto w-full h-full custom-scrollbar pt-[var(--content-top-offset,0px)]">
                  <main className="flex-1 w-full pb-32 pt-[max(80px,var(--content-pt,80px))] overflow-x-hidden transition-all duration-700">
                      {children}
                  </main>
                </div>
            </div>
            
            <WrldChanger />
            
            {/* DOCKED AUDIO CONTROLLER OVERLAY */}
            <StickyPlayer />
            
            {/* SYSTEM NAVIGATION HUD */}
            <NavigationHUD />
          </SpaceThemeWrapper>

      </body>
    </html>

  );
}
