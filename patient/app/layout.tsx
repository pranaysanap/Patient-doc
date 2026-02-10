import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/auth-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { VaidyaProvider } from '@/components/ai-assistant/vaidya-context';
import { VaidyaButton, VaidyaStyles } from '@/components/ai-assistant/vaidya-button';
import { Toaster as SonnerToaster } from 'sonner';
import { SOSButton } from '@/components/ui/sos-button';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VaidyaSetu - AI-Powered Healthcare',
  description: 'Transform your smartphone into a powerful diagnostic tool with VaidyaSetu',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <VaidyaProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <VaidyaButton />
              <VaidyaStyles />

              <SOSButton />
              <Toaster />
              <SonnerToaster position="top-right" closeButton theme="dark" richColors />
            </VaidyaProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}