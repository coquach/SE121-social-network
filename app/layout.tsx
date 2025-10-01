import { ModalProvider } from '@/components/providers/modal-providers';
import { QueryClientProviders } from '@/components/providers/query-client-providers';
import { ThemeProvider } from '@/components/theme-provider';
import { siteConfig } from '@/config/site';
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';



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
        <html lang="en">
          <body className={inter.className}>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              storageKey="sentimeta-theme"
              disableTransitionOnChange
            >

              <Toaster theme='light' richColors closeButton />
              <ModalProvider />

              {children}
            </ThemeProvider>
          </body>
        </html>
      </ClerkProvider>
    </QueryClientProviders>
  );
}
