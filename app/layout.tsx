import type { Metadata } from "next";
import { cookies } from "next/headers";
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
  title: "SafeOn · Cockpit Operacional",
  description:
    "Cockpit executivo com IA sobre a base do SafeOn — rastreamento, alertas e recuperação.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Largura do menu decidida no servidor para o primeiro render já sair certo.
  const recolhido = (await cookies()).get("menu-recolhido")?.value === "1";

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
        className="bg-background text-on-background font-body-md h-screen flex flex-col overflow-hidden"
        style={{ fontFamily: "var(--font-hanken-grotesk), sans-serif" }}
      >
        <Header />
        <div className="flex flex-1 min-h-0">
          <Sidebar inicialRecolhido={recolhido} />
          <main className="flex-1 min-w-0 overflow-y-auto">
            <div className="px-gutter py-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
