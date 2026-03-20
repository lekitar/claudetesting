export const metadata = {
  title: 'Hola Mundo',
  description: 'Hello World app deployed on Vercel',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
