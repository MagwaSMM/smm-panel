import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBalance, setEditingBalance] = useState({});
  const [balanceInputs, setBalanceInputs] = useState({});

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users?limit=100');
      setUsers(res.data.users);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserBalance = async (userId) => {
    const newBalance = parseFloat(balanceInputs[userId]);
    if (isNaN(newBalance)) return toast.error('Invalid amount');
    
    try {
      await api.patch(`/admin/users/${userId}`, { balance: newBalance });
      toast.success('Balance updated');
      setEditingBalance(prev => ({ ...prev, [userId]: false }));
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update balance');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-3">Username</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Role</th>
              <th className="pb-3">Balance</th>
              <th className="pb-3">Spent</th>
              <th className="pb-3">Orders</th>
              <th className="pb-3">Joined</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b last:border-0">
                <td className="py-3 font-medium">{user.username}</td>
                <td className="py-3 text-gray-600">{user.email}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${user.role === 'admin' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3">
                  {editingBalance[user.id] ? (
                    <input
                      type="number"
                      className="w-24 border rounded px-2 py-1 text-sm"
                      value={balanceInputs[user.id] ?? user.balance}
                      onChange={e => setBalanceInputs(prev => ({ ...prev, [user.id]: e.target.value }))}
                      step="0.01"
                    />
                  ) : (
                    <span className="font-semibold">${user.balance.toFixed(2)}</span>
                  )}
                </td>
                <td className="py-3">${user.totalSpent.toFixed(2)}</td>
                <td className="py-3">{user._count?.orders || 0}</td>
                <td className="py-3 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="py-3">
                  {editingBalance[user.id] ? (
                    <div className="space-x-1">
                      <button onClick={() => updateUserBalance(user.id)} className="text-green-600 text-xs hover:underline">Save</button>
                      <button onClick={() => setEditingBalance(prev => ({ ...prev, [user.id]: false }))} className="text-gray-500 text-xs hover:underline">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingBalance(prev => ({ ...prev, [user.id]: true })); setBalanceInputs(prev => ({ ...prev, [user.id]: user.balance })); }} className="text-primary-600 text-xs hover:underline">
                      Edit Balance
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
                      }
