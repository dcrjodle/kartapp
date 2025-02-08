import "./globals.css"
import { Inter } from "next/font/google"
import "maplibre-gl/dist/maplibre-gl.css"
import type React from "react" // Import React

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "MapLibre React TypeScript App",
  description: "A simple map application using MapLibre GL JS",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

