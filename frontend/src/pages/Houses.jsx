// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import DataTable from '../components/DataTable'; // Create reusable table

// const Houses = () => {
//   const [houses, setHouses] = useState([]);
//   const [filters, setFilters] = useState({});

//   const fetchHouses = async () => {
//     const { data } = await axios.get('/api/admin/houses', { params: filters });
//     setHouses(data);
//   };

//   useEffect(() => { fetchHouses(); }, [filters]);

//   const handleUpload = async (e) => {
//     const file = e.target.files[0];
//     const formData = new FormData();
//     formData.append('file', file);
//     await axios.post('/api/admin/upload-houses', formData);
//     fetchHouses();
//   };

//   return (
//     <div className="p-8">
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-4xl font-bold text-white">Houses</h1>
//         <label className="bg-blue-600 px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700">
//           Upload Houses Excel
//           <input type="file" accept=".xlsx,.xls" onChange={handleUpload} className="hidden" />
//         </label>
//       </div>

//       <DataTable 
//         data={houses} 
//         columns={['houseNumber', 'site', 'area', 'floor', 'status']}
//         statusField="status"
//       />
//     </div>
//   );
// };

// export default Houses;

import React, { useEffect, useState } from "react";
import axios from "axios";

const Houses = () => {
  const [houses, setHouses] = useState([]);

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/houses");
        setHouses(res.data);
      } catch (err) {
        console.error("Error fetching houses:", err);
      }
    };

    fetchHouses();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Houses</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">House ID</th>
              <th className="px-6 py-3 text-left">Site</th>
              <th className="px-6 py-3 text-left">Area</th>
              <th className="px-6 py-3 text-left">Floor</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {houses.map((house, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">{house.houseId}</td>
                <td className="px-6 py-4">{house.site}</td>
                <td className="px-6 py-4">{house.area}</td>
                <td className="px-6 py-4">{house.floor}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    house.status === 'provided' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {house.status || 'none'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Houses;