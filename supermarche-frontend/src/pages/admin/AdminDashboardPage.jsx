import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/AdminSidebar';

import SuperAdminDashboard from './dashboards/SuperAdminDashboard';
import AdminProduitsDashboard from './dashboards/AdminProduitsDashboard';
import AdminStockDashboard from './dashboards/AdminStockDashboard';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  
  // Mappage robuste des rôles
  const role = user?.typeAdmin || user?.role || '';
  
  const isSuper = role === 'super_admin' || role === 'super';
  const isProd = role === 'admin_produits' || role === 'produits';
  const isStock = role === 'admin_stock' || role === 'stock';

  let DashboardComponent = null;

  if (isSuper) {
    DashboardComponent = <SuperAdminDashboard />;
  } else if (isProd) {
    DashboardComponent = <AdminProduitsDashboard />;
  } else if (isStock) {
    DashboardComponent = <AdminStockDashboard />;
  } else {
    DashboardComponent = (
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#6E6E73', fontSize:16, fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",Inter' }}>
        <div style={{ textAlign:'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize:48, marginBottom:16, color:'#EDEDF2' }}>lock</span>
          <div>Tableau de bord non configuré pour ce rôle.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F7' }}>
      <AdminSidebar />
      {DashboardComponent}
    </div>
  );
}
