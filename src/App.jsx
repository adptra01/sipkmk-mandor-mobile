import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import UsageScreen from './screens/UsageScreen';
import SyncScreen from './screens/SyncScreen';

export default function App() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="loader-fullscreen">
        <div className="spinner" />
        <p>Memuat...</p>
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/pemakaian" element={<UsageScreen />} />
        <Route path="/sinkronisasi" element={<SyncScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
