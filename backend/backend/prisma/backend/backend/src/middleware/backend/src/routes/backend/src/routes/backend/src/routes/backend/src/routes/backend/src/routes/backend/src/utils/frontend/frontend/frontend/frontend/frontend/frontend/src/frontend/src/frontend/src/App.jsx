import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import NewOrder from './pages/NewOrder';
import Orders from './pages/Orders';
import AddFunds from './pages/AddFunds';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageServices from './pages/admin/ManageServices';
import ManageOrders from './pages/admin/ManageOrders';
import ManageUsers from './pages/admin/ManageUsers';
import LoadingSpinner from './components/LoadingSpinner';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={user ? <Navigate to="/dashboard" /> : <Home />} />
        <Route path="login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="services" element={<Services />} />
          <Route path="new-order" element={<NewOrder />} />
          <Route path="orders" element={<Orders />} />
          <Route path="add-funds" element={<AddFunds />} />
        </Route>

        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/services" element={<ManageServices />} />
          <Route path="admin/orders" element={<ManageOrders />} />
          <Route path="admin/users" element={<ManageUsers />} />
        </Route>
      </Route>
    </Routes>
  );
          }
