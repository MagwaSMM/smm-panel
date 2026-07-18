import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-bold text-gray-900 mb-6">
        Magwa SMM Panel
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Boost your social media presence with our comprehensive SMM services. 
        Fast delivery, competitive prices, and 24/7 support.
      </p>
      <div className="flex gap-4 justify-center">
        <Link to="/register" className="btn-primary text-lg !px-8 !py-3">
          Get Started
        </Link>
        <Link to="/login" className="btn-secondary text-lg !px-8 !py-3">
          Login
        </Link>
      </div>
      
      <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {[
          { title: 'Fast Delivery', desc: 'Most orders completed within minutes' },
          { title: '24/7 Support', desc: 'Round-the-clock customer assistance' },
          { title: 'Best Prices', desc: 'Competitive rates for all services' }
        ].map(feature => (
          <div key={feature.title} className="card text-center">
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
