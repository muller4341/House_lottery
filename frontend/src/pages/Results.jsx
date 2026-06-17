import { useEffect, useState } from 'react';
import axios from 'axios';

const Results = () => {
  const [history, setHistory] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    axios.get('/api/admin/lottery-history').then(res => setHistory(res.data));
  }, []);

  const loadResults = async (runId) => {
    const { data } = await axios.get(`/api/admin/results/${runId}`);
    setResults(data);
    setSelectedRun(runId);
  };

  const downloadExcel = (runId) => {
    window.location.href = `/api/admin/results/download/${runId}`;
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-white mb-8">Lottery History</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* History List */}
        <div className="lg:col-span-1 bg-gray-800 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4">Previous Draws</h3>
          {history.map((item) => (
            <div
              key={item.lotteryRunId}
              onClick={() => loadResults(item.lotteryRunId)}
              className="cursor-pointer p-4 hover:bg-gray-700 rounded-xl mb-3 transition"
            >
              <p className="font-medium">{new Date(item.drawDate).toLocaleDateString()}</p>
              <p className="text-sm text-gray-400">{item._count.id} participants</p>
            </div>
          ))}
        </div>

        {/* Results Table */}
        <div className="lg:col-span-2">
          {selectedRun && (
            <div className="bg-gray-800 rounded-2xl p-8">
              <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold">Results for Run: {selectedRun}</h2>
                <button
                  onClick={() => downloadExcel(selectedRun)}
                  className="bg-green-600 px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Download Excel
                </button>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="pb-4">Username</th>
                    <th className="pb-4">Site</th>
                    <th className="pb-4">Area</th>
                    <th className="pb-4">House No.</th>
                    <th className="pb-4">Floor</th>
                    <th className="pb-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="py-4">{r.username}</td>
                      <td>{r.site}</td>
                      <td>{r.area}</td>
                      <td>{r.houseNumber || '-'}</td>
                      <td>{r.floor || '-'}</td>
                      <td>
                        <span className={`px-4 py-1 rounded-full text-sm ${r.status === 'WINNER' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;