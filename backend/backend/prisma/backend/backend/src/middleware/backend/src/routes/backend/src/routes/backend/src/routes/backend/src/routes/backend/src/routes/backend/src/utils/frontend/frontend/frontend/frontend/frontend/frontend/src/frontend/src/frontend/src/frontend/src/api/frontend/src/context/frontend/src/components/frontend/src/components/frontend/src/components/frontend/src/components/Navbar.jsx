import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-xl font-bold text-primary-600">
            Magwa SMM
          </Link>
          
          {user && (
            <div className="flex items-center gap-6">
              <span className="text-sm text-gray-600">
                Balance: <span className="font-semibold text-green-600">${user.balance.toFixed(2)}</span>
              </span>
              
              <div className="hidden md:flex items-center gap-4">
                <Link to="/dashboard" className="text-sm text-gray-600 hover:text-primary-600">Dashboard</Link>
                <Link to="/services" className="text-sm text-gray-600 hover:text-primary-600">Services</Link>
                <Link to="/new-order" className="text-sm text-gray-600 hover:text-primary-600">New Order</Link>
                <Link to="/orders" className="text-sm text-gray-600 hover:text-primary-600">Orders</Link>
                <Link to="/add-funds" className="text-sm text-gray-600 hover:text-primary-600">Add Funds</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-medium text-orange-600 hover:text-orange-700">Admin</Link>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{user.username}</span>
                <button onClick={handleLogout} className="btn-secondary text-sm !px-3 !py-1.5">
                  Logout
                </button>
              </div>
            </div>
          )}

          {!user && (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm text-gray-600 hover:text-primary-600">Login</Link>
              <Link to="/register" className="btn-primary text-sm !px-4 !py-2">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
