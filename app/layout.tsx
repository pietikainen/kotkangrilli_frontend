import '@mantine/core/styles.css';

import React from 'react';
import { Metadata } from 'next';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import Providers from '@/components/Providers';
import { theme } from '@/theme';

export const metadata: Metadata = {
  title: 'Kotkan grilin lani hasutus',
  description: 'Kiva laniportaali',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <Providers>{children}</Providers>
        </MantineProvider>
      </body>
    </html>
  );
}
