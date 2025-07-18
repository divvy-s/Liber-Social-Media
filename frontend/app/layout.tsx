import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Web3Provider } from "@/components/web3-provider"
import { Toaster } from "@/components/ui/toaster"
import { SocketProvider } from "@/components/socket-context";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Liber",
  description: "Decentralized social media platform with NFT functionality",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <Web3Provider>
            <SocketProvider>
              {children}
              <Toaster />
            </SocketProvider>
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  )
}