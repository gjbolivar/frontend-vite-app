import React, { useState } from 'react';

const ReportFilter = ({ onFilter }) => {
  const [clientName, setClientName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleFilter = () => {
    onFilter({ clientName, startDate, endDate });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-3">Filtrar Reportes</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">Nombre del Cliente</label>
          <input
            type="text"
            id="clientName"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Ej: Juan Pérez"
          />
        </div>
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
          <input
            type="date"
            id="startDate"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Fecha Fin</label>
          <input
            type="date"
            id="endDate"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-4 text-right">
        <button
          onClick={handleFilter}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
};

export default ReportFilter;