import AppShell from "../components/AppShell.jsx";
import { usePermissions } from "../context/PermissionContext.jsx";

export default function PartnerLayout({ children }) {
  const { modules } = usePermissions(); // ✅ Component ke andar

  return (
    <AppShell variant="partner" modules={modules}>
      {children}
    </AppShell>
  );
}