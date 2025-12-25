import { ModalProvider } from '@/components/providers/modal-providers';
import PageWrapper from '@/components/providers/page-wrapper';
import QueryClientProviders from '@/components/providers/query-client-providers';
import { ThemeProvider } from '@/components/theme-provider';
import { siteConfig } from '@/config/site';
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { SocketProvider } from '@/components/providers/socket-provider';




const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: [
    {
      url: '/logo.svg',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryClientProviders>
          <ClerkProvider
            appearance={{
              theme: 'simple',
              variables: {
                colorPrimary: '#3730A3',
              },
            }}
            afterSignOutUrl="/marketing"
          >
            <PageWrapper>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                storageKey="sentimeta-theme"
                disableTransitionOnChange
              >
                <SocketProvider>
                  <Toaster theme="light" richColors closeButton />
                  <ModalProvider />

                  {children}
                </SocketProvider>
              </ThemeProvider>
            </PageWrapper>
          </ClerkProvider>
        </QueryClientProviders>
      </body>
    </html>
  );
}
