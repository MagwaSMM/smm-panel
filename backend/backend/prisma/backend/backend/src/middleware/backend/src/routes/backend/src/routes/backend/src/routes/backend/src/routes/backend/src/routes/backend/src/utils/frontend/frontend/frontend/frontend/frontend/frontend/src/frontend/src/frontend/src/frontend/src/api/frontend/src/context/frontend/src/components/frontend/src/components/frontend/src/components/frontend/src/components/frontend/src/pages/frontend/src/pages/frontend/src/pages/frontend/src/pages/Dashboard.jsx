import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, completedOrders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersRes = await api.get('/orders?limit=5');
        setRecentOrders(ordersRes.data.orders);
        
        const allOrders = await api.get('/orders?limit=1000');
        const orders = allOrders.data.orders;
        setStats({
          totalOrders: allOrders.data.pagination.total,
          pendingOrders: orders.filter(o => ['pending', 'processing'].includes(o.status)).length,
          completedOrders: orders.filter(o => o.status === 'completed').length,
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data');
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Balance', value: `$${user.balance.toFixed(2)}`, color: 'text-green-600' },
          { label: 'Total Orders', value: stats.totalOrders, color: 'text-blue-600' },
          { label: 'Pending', value: stats.pendingOrders, color: 'text-yellow-600' },
          { label: 'Completed', value: stats.completedOrders, color: 'text-emerald-600' }
        ].map(stat => (
          <div key={stat.label} className="card text-center">
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-6">
        <Link to="/new-order" className="btn-primary">New Order</Link>
        <Link to="/add-funds" className="btn-secondary">Add Funds</Link>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3">Service</th>
                  <th className="pb-3">Quantity</th>
                  <th className="pb-3">Charge</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3">{order.service?.name || 'N/A'}</td>
                    <td className="py-3">{order.quantity.toLocaleString()}</td>
                    <td className="py-3">${order.charge.toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium
                        ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
