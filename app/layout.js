import './globals.css';

export const metadata = {
  title: 'PerformIQ — Performance Review Platform',
  description: 'Modern performance review and employee development platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
