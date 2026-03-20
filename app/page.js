import Link from 'next/link';

export default function Home() {
  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Hola Mundo</h1>
        <p style={styles.subtitle}>Bienvenido a la aplicación</p>
        <div style={styles.links}>
          <Link href="/login" style={styles.button}>Iniciar Sesión</Link>
          <Link href="/register" style={styles.buttonOutline}>Crear Cuenta</Link>
        </div>
      </div>
    </main>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    fontFamily: 'sans-serif',
  },
  card: {
    backgroundColor: '#fff',
    padding: '48px 40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '360px',
    width: '100%',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '36px',
    fontWeight: '700',
    color: '#111',
  },
  subtitle: {
    margin: '0 0 32px',
    color: '#666',
    fontSize: '16px',
  },
  links: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  button: {
    display: 'block',
    padding: '13px',
    backgroundColor: '#0070f3',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
  },
  buttonOutline: {
    display: 'block',
    padding: '13px',
    backgroundColor: 'transparent',
    color: '#0070f3',
    border: '2px solid #0070f3',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
  },
};
