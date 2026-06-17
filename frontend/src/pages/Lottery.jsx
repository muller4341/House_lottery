import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const Lottery = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const runLottery = async () => {
    setLoading(true);
    setSpinning(true);

    try {
      const { data } = await axios.post('/api/admin/run-lottery');
      
      // Simulate spinner delay
      setTimeout(() => {
        setResults(data);
        setSpinning(false);
        if (data.totalWinners > 0) {
          confetti({ particleCount: 150, spread: 70 });
        }
      }, 2500);
    } catch (err) {
      alert(err.response?.data?.error || 'Lottery failed');
      setSpinning(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-10 text-center">House Lottery Draw</h1>

      <div className="bg-gray-800 rounded-3xl p-12 text-center">
        <div className="mb-12">
          <motion.div
            animate={spinning ? { rotate: 3600 } : {}}
            transition={{ duration: 2.5, ease: "easeOut" }}
            className="w-64 h-64 mx-auto border-8 border-dashed border-blue-500 rounded-full flex items-center justify-center text-6xl"
          >
            🎡
          </motion.div>
        </div>

        <button
          onClick={runLottery}
          disabled={loading || spinning}
          className="bg-gradient-to-r from-red-600 to-orange-600 text-white text-2xl px-16 py-6 rounded-2xl font-bold hover:scale-105 transition disabled:opacity-50"
        >
          {spinning ? 'DRAWING...' : 'START LOTTERY DRAW'}
        </button>

        <p className="text-gray-400 mt-4">This will fairly assign houses by Site + Area</p>
      </div>

      <AnimatePresence>
        {results && (
          <div className="mt-12 bg-gray-800 rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-6">Lottery Results</h2>
            <p className="text-green-400 text-xl">Run ID: {results.lotteryRunId}</p>
            <div className="mt-8">
              <a href={`/results?runId=${results.lotteryRunId}`} className="inline-block bg-green-600 px-8 py-4 rounded-xl text-white font-semibold">
                View Full Results →
              </a>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Lottery;