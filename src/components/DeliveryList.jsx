import React, { useState, useEffect } from 'react';
import { getStorage, setStorage } from '../utils/storage';

const DeliveryList = ({ onCreateNew, onViewDelivery }) => {
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    setDeliveries(getStorage('deliveries'));
  }, []);

  const handleDeleteDelivery = (deliveryId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta Cotización Aprobada?')) {
      const currentDeliveries = getStorage('deliveries');
      const updatedDeliveries = currentDeliveries.filter(delivery => delivery.id !== deliveryId);
      setStorage('deliveries', updatedDeliveries);
      setDeliveries(updatedDeliveries);
      alert('Cotización Aprobada eliminada correctamente.');
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          📦 Cotizaciones Aprobadas
        </h2>
        <button
          onClick={onCreateNew}
          className="btn-blue px-4 py-2 rounded-md text-white font-semibold shadow hover:shadow-md transition"
        >
          ➕ Nueva
        </button>
      </div>

      {deliveries.length === 0 ? (
        <p className="text-gray-500 text-center">No hay cotizaciones aprobadas aún.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-50 text-gray-700 font-semibold">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {deliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{delivery.id}</td>
                  <td className="px-4 py-2">{delivery.client}</td>
                  <td className="px-4 py-2">{delivery.date}</td>
                  <td className="px-4 py-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => onViewDelivery(delivery)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => handleDeleteDelivery(delivery.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DeliveryList;
