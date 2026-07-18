import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Services() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        if (search) params.search = search;
        
        const res = await api.get('/services', { params });
        setServices(res.data);
      } catch (err) {
        console.error('Failed to fetch services');
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await api.get('/services/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to fetch categories');
      }
    };

    fetchServices();
    fetchCategories();
  }, [selectedCategory, search]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Services</h1>
        <Link to="/new-order" className="btn-primary">Place Order</Link>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search services..."
            className="input-field flex-1"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="input-field sm:w-48"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(service => (
            <div key={service.id} className="card hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg">{service.name}</h3>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{service.category}</span>
              </div>
              {service.description && (
                <p className="text-sm text-gray-600 mb-3">{service.description}</p>
              )}
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>Min: {service.minQuantity}</span>
                <span>Max: {service.maxQuantity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-primary-600">
                  ${service.price.toFixed(2)}<span className="text-xs text-gray-400">/1k</span>
                </span>
                <Link to={`/new-order?serviceId=${service.id}`} className="btn-primary text-sm !px-3 !py-1.5">
                  Order
                </Link>
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <p className="text-gray-500 col-span-full text-center py-10">No services found.</p>
          )}
        </div>
      )}
    </div>
  );
                  }
