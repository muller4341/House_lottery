import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Home, Award, Clock } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await axios.get('/api/admin/dashboard');
      setStats(data);
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-white mb-10">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl">
          <Home className="text-blue-400 mb-4" size={32} />
          <h3 className="text-gray-400">Total Houses</h3>
          <p className="text-5xl font-bold text-white">{stats.totalHouses}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl">
          <Home className="text-green-400 mb-4" size={32} />
          <h3 className="text-gray-400">Available Houses</h3>
          <p className="text-5xl font-bold text-green-400">{stats.availableHouses}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl">
          <Users className="text-purple-400 mb-4" size={32} />
          <h3 className="text-gray-400">Total Applicants</h3>
          <p className="text-5xl font-bold text-white">{stats.totalApplicants}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl">
          <Award className="text-yellow-400 mb-4" size={32} />
          <h3 className="text-gray-400">Winners</h3>
          <p className="text-5xl font-bold text-yellow-400">{stats.winners}</p>
        </div>
      </div>

      <div className="mt-10 flex gap-4">
        <a href="/lottery" className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 rounded-xl text-white font-semibold text-lg hover:scale-105 transition">
          Run New Lottery
        </a>
        <a href="/results" className="bg-gray-700 px-8 py-4 rounded-xl text-white font-semibold text-lg hover:bg-gray-600 transition">
          View All Results
        </a>
      </div>
    </div>
  );
};

export default Dashboard;