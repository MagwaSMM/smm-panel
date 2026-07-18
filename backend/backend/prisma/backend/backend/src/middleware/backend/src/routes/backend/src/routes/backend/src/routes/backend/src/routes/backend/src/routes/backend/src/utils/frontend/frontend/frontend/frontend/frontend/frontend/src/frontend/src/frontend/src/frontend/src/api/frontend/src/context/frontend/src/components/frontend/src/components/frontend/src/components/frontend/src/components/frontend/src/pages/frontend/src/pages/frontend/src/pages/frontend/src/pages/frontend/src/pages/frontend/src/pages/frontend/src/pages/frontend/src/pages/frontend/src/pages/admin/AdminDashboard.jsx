import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return <p>Failed to load admin data.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: stats.totalUsers, color: 'text-blue-600' },
          { label: 'Total Orders', value: stats.totalOrders, color: 'text-purple-600' },
          { label: 'Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, color: 'text-green-600' },
          { label: 'Pending', value: stats.pendingOrders, color: 'text-yellow-600' }
        ].map(stat => (
          <div key={stat.label} className="card text-center">
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Link to="/admin/services" className="card hover:shadow-md transition-shadow text-center">
          <h3 className="font-semibold text-lg">Manage Services</h3>
          <p className="text-sm text-gray-500">Add, edit, or remove services</p>
        </Link>
        <Link to="/admin/orders" className="card hover:shadow-md transition-shadow text-center">
          <h3 className="font-semibold text-lg">Manage Orders</h3>
          <p className="text-sm text-gray-500">View and update order statuses</p>
        </Link>
        <Link to="/admin/users" className="card hover:shadow-md transition-shadow text-center">
          <h3 className="font-semibold text-lg">Manage Users</h3>
          <p className="text-sm text-gray-500">View users, adjust balances</p>
        </Link>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3">User</th>
                <th className="pb-3">Service</th>
                <th className="pb-3">Qty</th>
                <th className="pb-3">Charge</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map(order => (
                <tr key={order.id} className="border-b last:border-0">
                  <td className="py-3">{order.user?.username}</td>
                  <td className="py-3">{order.service?.name}</td>
                  <td className="py-3">{order.quantity}</td>
                  <td className="py-3">${order.charge.toFixed(2)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>{order.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
