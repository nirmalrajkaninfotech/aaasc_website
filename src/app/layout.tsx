import type { Metadata } from "next";
import "./globals.css";
import HeaderWrapper from '@/components/HeaderWrapper';
import Footer from '@/components/Footer';
import { SiteSettings } from '@/types';
import React from 'react';
import { readSiteSettings } from '@/lib/data';

async function getSiteSettings(): Promise<SiteSettings> {
  return readSiteSettings();
}

export const metadata: Metadata = {
  title: "My Collage Website",
  description: "A customizable collage website",
};

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function generateThemeCSS(hex: string): string {
  const { h, s, l } = hexToHsl(hex);

  const blueShades: Record<string, number> = {
    50: 97, 100: 94, 200: 86, 300: 74, 400: 62,
    500: 50, 600: 42, 700: 34, 800: 26, 900: 18, 950: 12,
  };

  const blueVars = Object.entries(blueShades)
    .map(([shade, lightness]) => `--color-blue-${shade}: hsl(${h}, ${s}%, ${lightness}%);`)
    .join('\n          ');

  const bgPrimary = `hsl(${h}, ${s}%, ${l}%)`;
  const bgSecondary = `hsl(${h}, ${s}%, ${l > 50 ? Math.max(0, l - 5) : Math.min(100, l + 5)}%)`;
  const bgCard = l < 40 ? `hsl(${h}, ${s}%, ${Math.min(100, l + 5)}%)` : '#ffffff';
  
  const textColor = l > 40 ? `hsl(${h}, ${Math.min(s, 30)}%, 12%)` : `hsl(${h}, ${Math.min(s, 10)}%, 90%)`;
  const textSecondary = l > 40 ? `hsl(${h}, ${Math.min(s, 20)}%, 40%)` : `hsl(${h}, ${Math.min(s, 10)}%, 70%)`;
  const borderColor = l > 40 ? `hsl(${h}, ${s}%, ${Math.max(0, l - 10)}%)` : `hsl(${h}, ${s}%, ${Math.min(100, l + 10)}%)`;

  return `
          ${blueVars}
          --theme-bg: ${bgPrimary};
          --theme-bg-secondary: ${bgSecondary};
          --theme-bg-card: ${bgCard};
          --theme-text: ${textColor};
          --theme-text-secondary: ${textSecondary};
          --theme-border: ${borderColor};
  `;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteSettings = await getSiteSettings();
  const isAdminRoute = false;
  const themeColor = siteSettings.themeColor || '#1e293b';
  const themeCSS = generateThemeCSS(themeColor);

  return (
    <html lang="en">
      <body
        className="min-h-screen flex flex-col"
        style={{
          backgroundColor: 'var(--theme-bg)',
          color: 'var(--theme-text)',
        } as React.CSSProperties}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            ${themeCSS}
          }
        `}} />
        <HeaderWrapper siteSettings={siteSettings} />
        <main className="flex-1">
          {children}
        </main>
        {!isAdminRoute && <Footer siteSettings={siteSettings} />}
      </body>
    </html>
  );
}
