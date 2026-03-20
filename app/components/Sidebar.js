'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const NAV = [
  {
    href: '/dashboard',
    label: 'Inicio',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    href: '/my-reviews',
    label: 'Mis revisiones',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  },
  {
    href: '/review-cycles',
    label: 'Ciclos',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  },
  {
    href: '/employees',
    label: 'Equipo',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    href: '/goals',
    label: 'Objetivos',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  },
  {
    href: '/reports',
    label: 'Reportes',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  },
];

export default function Sidebar({ user, profile }) {
  const router = useRouter();
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);

  const isSuperAdmin = profile?.role === 'super_admin';
  const userName = user?.email?.split('@')[0] || 'Usuario';
  const initials = userName.slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isActive = (href) =>
    pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));

  return (
    <aside style={{
      width: 224,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      background: '#111110',
      minHeight: '100vh',
      position: 'sticky',
      top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#111110" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            PerformIQ
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '7px 10px',
                borderRadius: 7,
                border: 'none',
                background: active ? 'rgba(255,255,255,0.09)' : 'transparent',
                color: active ? '#FFFFFF' : '#6B6B6B',
                fontSize: 13.5,
                fontWeight: active ? 500 : 400,
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                transition: 'background 0.1s, color 0.1s',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = '#A8A29E';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#6B6B6B';
                }
              }}
            >
              <span style={{ opacity: active ? 1 : 0.6 }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}

        {isSuperAdmin && (
          <>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
            <button
              onClick={() => router.push('/admin')}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '7px 10px', borderRadius: 7, border: 'none',
                background: isActive('/admin') ? 'rgba(255,255,255,0.09)' : 'transparent',
                color: isActive('/admin') ? '#FFFFFF' : '#6B6B6B',
                fontSize: 13.5, fontWeight: 400, cursor: 'pointer', width: '100%', textAlign: 'left',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#A8A29E'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B6B6B'; }}
            >
              <span style={{ opacity: 0.6 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </span>
              Admin
            </button>
          </>
        )}
      </nav>

      {/* User */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 10px', borderRadius: 7 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: '#292524',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600, color: '#A8A29E', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#D6D3D1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userName}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            title="Cerrar sesión"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4B4945', padding: 2, display: 'flex', alignItems: 'center' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#78716C'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#4B4945'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
