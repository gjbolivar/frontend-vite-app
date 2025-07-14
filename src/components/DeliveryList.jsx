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
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">Cotizaciones Aprobadas</h2>
      </div>
      {deliveries.length === 0 ? (
        <p className="text-gray-500">No hay cotizaciones aprobadas creadas aún.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Cliente</th>
                <th className="py-2 px-4 border-b">Fecha</th>
                <th className="py-2 px-4 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-sm">{delivery.id}</td>
                  <td className="py-2 px-4 border-b text-sm">{delivery.client}</td>
                  <td className="py-2 px-4 border-b text-sm">{delivery.date}</td>
                  <td className="py-2 px-4 border-b text-sm flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={() => onViewDelivery(delivery)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => handleDeleteDelivery(delivery.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
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


// DONE