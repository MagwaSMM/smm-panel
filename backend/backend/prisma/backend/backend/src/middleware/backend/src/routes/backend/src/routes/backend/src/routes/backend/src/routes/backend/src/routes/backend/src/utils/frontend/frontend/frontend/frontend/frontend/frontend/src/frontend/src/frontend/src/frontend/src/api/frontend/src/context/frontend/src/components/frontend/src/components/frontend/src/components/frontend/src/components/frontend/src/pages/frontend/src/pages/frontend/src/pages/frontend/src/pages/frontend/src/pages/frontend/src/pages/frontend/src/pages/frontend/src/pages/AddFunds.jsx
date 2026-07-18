import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AddFunds() {
  const { user, updateBalance } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const presetAmounts = [10, 25, 50, 100, 250, 500];

  const handleAddFunds = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt < 5) {
      return toast.error('Minimum amount is $5');
    }

    setLoading(true);
    try {
      const res = await api.post('/payments/add-funds', { amount: amt });
      updateBalance(res.data.newBalance);
      toast.success(res.data.message);
      setAmount('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add funds');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add Funds</h1>

      <div className="card mb-4">
        <p className="text-sm text-gray-600 mb-2">Current Balance</p>
        <p className="text-3xl font-bold text-green-600">${user.balance.toFixed(2)}</p>
      </div>

      <div className="card">
        <form onSubmit={handleAddFunds} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Amount</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {presetAmounts.map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toString())}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                    amount === amt.toString()
                      ? 'border-primary-600 bg-primary-50 text-primary-600'
                      : 'border-gray-300 text-gray-700 hover:border-primary-400'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Amount</label>
            <input
              type="number"
              className="input-field"
              placeholder="Enter amount..."
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="5"
              step="0.01"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
            {loading ? 'Processing...' : `Add $${amount || '0'}`}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-4 text-center">
          This is a demo. In production, you would be redirected to a payment gateway.
        </p>
      </div>
    </div>
  );
}
