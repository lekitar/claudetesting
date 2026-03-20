'use client';
import { useState } from 'react';
import Link from 'next/link';

const STEPS = ['email', 'code', 'newPassword', 'success'];

export default function ForgotPasswordPage() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const stepIndex = STEPS.indexOf(step) + 1;

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError('');
    setStep('code');
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos.');
      return;
    }
    setStep('newPassword');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setStep('success');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Progress bar */}
        {step !== 'success' && (
          <div style={styles.progressContainer}>
            {STEPS.slice(0, 3).map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  ...styles.dot,
                  backgroundColor: stepIndex > i ? '#0070f3' : '#ddd',
                  color: stepIndex > i ? '#fff' : '#aaa',
                }}>
                  {stepIndex > i + 1 ? '✓' : i + 1}
                </div>
                {i < 2 && <div style={{ ...styles.line, backgroundColor: stepIndex > i + 1 ? '#0070f3' : '#ddd' }} />}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Email */}
        {step === 'email' && (
          <>
            <h1 style={styles.title}>¿Olvidaste tu contraseña?</h1>
            <p style={styles.subtitle}>
              Ingresa tu correo y te enviaremos un código de verificación.
            </p>
            <form onSubmit={handleEmailSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  style={styles.input}
                />
              </div>
              <button type="submit" style={styles.button}>
                Enviar código
              </button>
            </form>
          </>
        )}

        {/* Step 2: Verification Code */}
        {step === 'code' && (
          <>
            <h1 style={styles.title}>Revisa tu correo</h1>
            <p style={styles.subtitle}>
              Enviamos un código de 6 dígitos a <strong>{email}</strong>. Revisa tu bandeja de entrada y carpeta de spam.
            </p>
            <form onSubmit={handleCodeSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Código de verificación</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  required
                  style={{ ...styles.input, letterSpacing: '6px', fontSize: '22px', textAlign: 'center' }}
                />
              </div>
              {error && <p style={styles.error}>{error}</p>}
              <button type="submit" style={styles.button}>
                Verificar código
              </button>
              <button
                type="button"
                onClick={() => setStep('email')}
                style={styles.ghostButton}
              >
                ← Cambiar correo
              </button>
            </form>
            <p style={styles.resend}>
              ¿No recibiste el correo?{' '}
              <button onClick={() => alert('Código reenviado')} style={styles.linkButton}>
                Reenviar código
              </button>
            </p>
          </>
        )}

        {/* Step 3: New Password */}
        {step === 'newPassword' && (
          <>
            <h1 style={styles.title}>Nueva contraseña</h1>
            <p style={styles.subtitle}>
              Elige una contraseña segura para tu cuenta.
            </p>
            <form onSubmit={handlePasswordSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Nueva contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Confirmar contraseña</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu nueva contraseña"
                  required
                  style={styles.input}
                />
              </div>
              {error && <p style={styles.error}>{error}</p>}
              <button type="submit" style={styles.button}>
                Guardar contraseña
              </button>
            </form>
          </>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div style={styles.successContainer}>
            <div style={styles.checkCircle}>✓</div>
            <h1 style={styles.title}>¡Contraseña actualizada!</h1>
            <p style={styles.subtitle}>
              Tu contraseña fue cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <Link href="/login" style={styles.button}>
              Ir a Iniciar Sesión
            </Link>
          </div>
        )}

        {step !== 'success' && (
          <p style={styles.footer}>
            <Link href="/login" style={styles.link}>
              ← Volver a Iniciar Sesión
            </Link>
          </p>
        )}
      </div>
    </div>
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
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '420px',
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '32px',
    gap: '0',
  },
  dot: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    flexShrink: 0,
  },
  line: {
    width: '40px',
    height: '2px',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '26px',
    fontWeight: '700',
    color: '#111',
  },
  subtitle: {
    margin: '0 0 28px',
    color: '#666',
    fontSize: '15px',
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '15px',
    outline: 'none',
  },
  error: {
    color: '#e00',
    fontSize: '14px',
    margin: '0',
  },
  button: {
    display: 'block',
    padding: '13px',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center',
    textDecoration: 'none',
    marginTop: '4px',
  },
  ghostButton: {
    padding: '11px',
    backgroundColor: 'transparent',
    color: '#555',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '15px',
    cursor: 'pointer',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '14px',
  },
  link: {
    color: '#0070f3',
    textDecoration: 'none',
    fontWeight: '600',
  },
  resend: {
    marginTop: '16px',
    textAlign: 'center',
    color: '#666',
    fontSize: '14px',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#0070f3',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
    padding: 0,
  },
  successContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '12px',
  },
  checkCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#0070f3',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '8px',
  },
};
