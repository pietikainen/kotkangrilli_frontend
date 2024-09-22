import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import 'mantine-react-table/styles.css';
import 'dayjs/locale/fi';

import React from 'react';
import { Metadata } from 'next';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { Notifications } from '@mantine/notifications';
import Providers from '@/components/Providers';
import theme from '@/theme';

export const metadata: Metadata = {
  title: 'Kotkangrilli',
  description: 'Portal',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // noinspection HtmlRequiredTitleElement
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <DatesProvider settings={{ locale: 'fi' }}>
            <Providers>{children}</Providers>
          </DatesProvider>
          <Notifications />
        </MantineProvider>
      </body>
    </html>
  );
}
