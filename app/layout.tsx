import type { Metadata } from "next";
import { Rajdhani } from "next/font/google";
import "./globals.css";
import AudioEngine from "@/components/global/AudioEngine";
import WarpBackground from "@/components/global/WarpBackground";
import StickyPlayer from "@/components/ui/StickyPlayer";
import SpaceThemeWrapper from "@/components/global/SpaceThemeWrapper";
import WrldChanger from "@/components/global/WrldChanger";
import AgeVerificationModal from "@/components/global/AgeVerificationModal";
import AuthEngine from "@/components/global/AuthEngine";

const raj = Rajdhani({
  variable: "--font-rajdhani",
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpaceJamz Studio V3B | The Architect's Matrix",
  description: "Neural Interface and Audio Delivery Engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${raj.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-transparent text-white overflow-hidden">
          
          <AuthEngine />
          <AgeVerificationModal />
          <SpaceThemeWrapper>
            {/* BACKGROUND AUDIO-VISUAL PHYSICS ENGINE */}
            <AudioEngine />
            <WarpBackground />
            
            {/* PHASE 3: THE HIGH-TECH INTERFACE BORDER */}
            <div className="interface-border-wrapper">
                <div className="interface-border-glow-top" />
                <div className="interface-border-glow-bottom" />
                
                {/* INNER SCROLLABLE / INTERACTIVE REALM */}
                <div className="audio-filter-target interface-interactive flex-1 flex flex-col z-[50] relative overflow-y-auto w-full h-full">
                  <main className="flex-1 w-full pb-24 md:pb-[90px] pt-4 px-4 overflow-x-hidden">
                      {children}
                  </main>
                </div>

            </div>
            
            <WrldChanger />
            {/* DOCKED AUDIO CONTROLLER OVERLAY */}
            <div className="interface-interactive relative z-[90000]">
              <StickyPlayer />
            </div>
          </SpaceThemeWrapper>

      </body>
    </html>

  );
}
