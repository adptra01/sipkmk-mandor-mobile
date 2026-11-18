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
          <span className="nav-icon">🏠</span>Beranda
        </NavLink>
        <NavLink to="/pemakaian">
          <span className="nav-icon">📋</span>Pemakaian
        </NavLink>
        <NavLink to="/sinkronisasi">
          <span className="nav-icon">🔄</span>Sinkronisasi
        </NavLink>
      </nav>
    </div>
  );
}
