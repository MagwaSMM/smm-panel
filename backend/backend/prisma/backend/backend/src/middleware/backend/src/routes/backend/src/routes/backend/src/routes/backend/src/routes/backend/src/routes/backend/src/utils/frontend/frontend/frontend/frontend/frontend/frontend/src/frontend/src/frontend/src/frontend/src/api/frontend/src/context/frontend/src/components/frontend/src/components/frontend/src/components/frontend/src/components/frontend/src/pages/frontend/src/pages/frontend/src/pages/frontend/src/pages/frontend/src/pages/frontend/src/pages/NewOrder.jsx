import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function NewOrder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateBalance } = useAuth();
  
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/services').then(res => {
      setServices(res.data);
      const serviceId = searchParams.get('serviceId');
      if (serviceId) {
        const found = res.data.find(s => s.id === serviceId);
        if (found) setSelectedService(found);
      }
    }).catch(console.error);
  }, [searchParams]);

  const handleServiceSelect = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    setSelectedService(service);
    setQuantity('');
  };

  const calculatedCharge = selectedService && quantity
    ? ((selectedService.price / 1000) * parseInt(quantity)).toFixed(2)
    : '0.00';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedService || !link || !quantity) {
      return toast.error('Please fill all fields');
    }

    setLoading(true);
    try {
      const res = await api.post('/orders', {
        serviceId: selectedService.id,
        link,
        quantity: parseInt(quantity)
      });
      updateBalance(res.data.newBalance);
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Order</h1>
      
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
            <select
              className="input-field"
              value={selectedService?.id || ''}
              onChange={e => handleServiceSelect(e.target.value)}
              required
            >
              <option value="">Select a service...</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} - ${service.price.toFixed(2)}/1k ({service.category})
                </option>
              ))}
            </select>
          </div>

          {selectedService && (
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
              <p><span className="text-gray-500">Rate:</span> <span className="font-medium">${selectedService.price.toFixed(2)} per 1,000</span></p>
              <p><span className="text-gray-500">Min Quantity:</span> <span className="font-medium">{selectedService.minQuantity.toLocaleString()}</span></p>
              <p><span className="text-gray-500">Max Quantity:</span> <span className="font-medium">{selectedService.maxQuantity.toLocaleString()}</span></p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
            <input
              type="url"
              className="input-field"
              placeholder="https://..."
              value={link}
              onChange={e => setLink(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              className="input-field"
              placeholder="Enter quantity..."
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              min={selectedService?.minQuantity || 1}
              max={selectedService?.maxQuantity || 100000}
              required
            />
          </div>

          <div className="bg-primary-50 rounded-lg p-4 flex justify-between items-center">
            <span className="font-medium">Total Charge:</span>
            <span className="text-2xl font-bold text-primary-600">${calculatedCharge}</span>
          </div>

          <button type="submit" disabled={loading || !selectedService} className="btn-primary w-full !py-3">
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
}
