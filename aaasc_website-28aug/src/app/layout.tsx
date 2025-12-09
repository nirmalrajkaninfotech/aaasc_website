// Minimal root layout for backend-only Next.js API
// This layout is required by Next.js but won't be used for API routes
import React from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
