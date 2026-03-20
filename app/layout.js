import './globals.css';

export const metadata = {
  title: 'Condor Agency Performance Review',
  description: 'Plataforma de evaluación de desempeño de Condor Agency',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
