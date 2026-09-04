import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Careers | Vivantify Technology Solutions',
  description: 'Explore opportunities and apply for roles at Vivantify Technology Solutions.',
  icons: {
    icon: '/favicon.svg'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
