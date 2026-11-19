import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOnlineStatus } from '../pwa/offline';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const nama = user?.nama || user?.email || 'Mandor';
  const online = useOnlineStatus();

  return (
    <div className="app-shell">
      <header className="header">
        <span className="header-brand">SI-PKMK Mandor</span>
        <div className="header-right">
          <span
            className="status-chip"
            style={{
              background: online ? '#22c55e' : '#ef4444',
              color: '#fff',
              borderRadius: '999px',
              padding: '2px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              marginRight: '8px',
            }}
          >
            {online ? 'Daring' : 'Luring'}
          </span>
          <span className="header-user">{nama}</span>
          <button className="btn-logout" onClick={logout}>Keluar</button>
        </div>
      </header>

      <main className="main-content">
        {children ?? <Outlet />}
      </main>

      <nav className="bottom-nav">
        <NavLink to="/" end>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>Beranda
        </NavLink>
        <NavLink to="/pemakaian">
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6M9 16h6"/></svg>Pemakaian
        </NavLink>
        <NavLink to="/sinkronisasi">
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>Sinkronisasi
        </NavLink>
      </nav>
    </div>
  );
}
