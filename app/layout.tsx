import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import Sidebar from "@/components/shell/Sidebar";
import Header from "@/components/shell/Header";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cockpit Inteligente de Gestão de Empreendimentos",
  description:
    "Protótipo de cockpit executivo com IA para monitoramento de empreendimentos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${hankenGrotesk.variable} ${jetBrainsMono.variable}`}>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- ícone (Material Symbols), não fonte de texto; root layout é o local correto no App Router */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="bg-background text-on-background font-body-md h-screen flex overflow-hidden"
        style={{ fontFamily: "var(--font-hanken-grotesk), sans-serif" }}
      >
        <Sidebar />
        <main className="ml-64 flex-1 flex flex-col h-full overflow-hidden relative bg-[#f5f6f8]">
          <Header />
          <div className="flex-1 overflow-y-auto p-gutter relative">{children}</div>
        </main>
      </body>
    </html>
  );
}
