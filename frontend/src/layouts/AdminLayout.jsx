import AppShell from '../components/AppShell.jsx';

export default function AdminLayout({ children }) {
  return <AppShell variant="admin">{children}</AppShell>;
}
