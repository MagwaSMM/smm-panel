import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ManageServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editService, setEditService] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', category: '', price: '',
    minQuantity: 10, maxQuantity: 100000, providerServiceId: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/services');
      setServices(res.data);
    } catch (err) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, price: parseFloat(form.price), minQuantity: parseInt(form.minQuantity), maxQuantity: parseInt(form.maxQuantity) };
      if (editService) {
        await api.put(`/admin/services/${editService.id}`, data);
        toast.success('Service updated');
      } else {
        await api.post('/admin/services', data);
        toast.success('Service created');
      }
      setShowForm(false);
      setEditService(null);
      resetForm();
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save service');
    }
  };

  const handleEdit = (service) => {
    setEditService(service);
    setForm({
      name: service.name, description: service.description || '',
      category: service.category, price: service.price.toString(),
      minQuantity: service.minQuantity, maxQuantity: service.maxQuantity,
      providerServiceId: service.providerServiceId
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this service?')) return;
    try {
      await api.delete(`/admin/services/${id}`);
      toast.success('Service deactivated');
      fetchServices();
    } catch (err) {
      toast.error('Failed to delete service');
    }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', category: '', price: '', minQuantity: 10, maxQuantity: 100000, providerServiceId: '' });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Services</h1>
        <button onClick={() => { setShowForm(!showForm); resetForm(); setEditService(null); }} className="btn-primary">
          {showForm ? 'Cancel' : 'Add Service'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">{editService ? 'Edit' : 'New'} Service</h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input className="input-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="input-field" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price per 1k</label>
              <input type="number" step="0.01" className="input-field" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider Service ID</label>
              <input className="input-field" value={form.providerServiceId} onChange={e => setForm({...form, providerServiceId: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Quantity</label>
              <input type="number" className="input-field" value={form.minQuantity} onChange={e => setForm({...form, minQuantity: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Quantity</label>
              <input type="number" className="input-field" value={form.maxQuantity} onChange={e => setForm({...form, maxQuantity: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="btn-primary w-full">{editService ? 'Update' : 'Create'} Service</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-3">Name</th>
              <th className="pb-3">Category</th>
              <th className="pb-3">Price/1k</th>
              <th className="pb-3">Min</th>
              <th className="pb-3">Max</th>
              <th className="pb-3">Active</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service.id} className="border-b last:border-0">
                <td className="py-3 font-medium">{service.name}</td>
                <td className="py-3">{service.category}</td>
                <td className="py-3">${service.price.toFixed(2)}</td>
                <td className="py-3">{service.minQuantity}</td>
                <td className="py-3">{service.maxQuantity.toLocaleString()}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 space-x-2">
                  <button onClick={() => handleEdit(service)} className="text-primary-600 hover:underline text-xs">Edit</button>
                  <button onClick={() => handleDelete(service.id)} className="text-red-600 hover:underline text-xs">Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
          }
