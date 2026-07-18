import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 50 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/admin/orders', { params });
      setOrders(res.data.orders);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchOrders(pagination.page);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Orders</h1>

      <div className="card mb-6">
        <select className="input-field sm:w-48" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="partial">Partial</option>
          <option value="cancelled">Cancelled</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-3">ID</th>
              <th className="pb-3">User</th>
              <th className="pb-3">Service</th>
              <th className="pb-3">Qty</th>
              <th className="pb-3">Charge</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Date</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b last:border-0">
                <td className="py-3 font-mono text-xs">{order.id.slice(0, 8)}</td>
                <td className="py-3">{order.user?.username}</td>
                <td className="py-3">{order.service?.name}</td>
                <td className="py-3">{order.quantity.toLocaleString()}</td>
                <td className="py-3">${order.charge.toFixed(2)}</td>
                <td className="py-3">
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order.id, e.target.value)}
                    className="text-xs border rounded px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="partial">Partial</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="failed">Failed</option>
                  </select>
                </td>
                <td className="py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="py-3">
                  <a href={order.link} target="_blank" rel="noopener noreferrer" className="text-primary-600 text-xs hover:underline">Link</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
