import React from 'react';
import PrintButton from './PrintButton';
import { getPartDetails } from '../utils/inventoryUtils';
import { warehouses } from '../mock/warehouses';
import { currencies } from '../mock/currencies';
import { updateStock } from '../utils/inventoryUtils';
import { getStorage, setStorage } from '../utils/storage';

const DeliveryDocument = ({ delivery, onBackToList }) => {
  const totalDelivery = delivery.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const selectedCurrencySymbol = currencies.find(c => c.id === delivery.currency)?.symbol || '$';

  const handleReturnToStock = () => {
    if (window.confirm('¿Estás seguro de que quieres devolver esta Cotización Aprobada al stock?')) {
      updateStock(delivery.items, 'add');
      const currentDeliveries = getStorage('deliveries');
      const updatedDeliveries = currentDeliveries.map(d =>
        d.id === delivery.id ? { ...d, status: 'devuelta' } : d
      );
      setStorage('deliveries', updatedDeliveries);
      alert('Artículos devueltos al stock correctamente.');
      onBackToList();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 print:p-0 print:shadow-none max-w-6xl mx-auto mt-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-2xl font-bold text-dark">
          📦 Cotización Aprobada #{delivery.id}
        </h2>
        <div className="flex gap-2">
          <PrintButton documentId={delivery.id} documentType="Cotización Aprobada" />
          {delivery.status !== 'devuelta' && (
            <button
              onClick={handleReturnToStock}
              className="btn-yellow flex items-center gap-2"
            >
              🔁 Devolver
            </button>
          )}
          <button
            onClick={onBackToList}
            className="btn-gray flex items-center gap-2"
          >
            🔙 Volver
          </button>
        </div>
      </div>

      {/* Información del Cliente */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p><strong className="text-gray-600">Cliente:</strong> {delivery.client}</p>
          <p><strong className="text-gray-600">RIF:</strong> {delivery.rif}</p>
          <p><strong className="text-gray-600">Teléfono:</strong> {delivery.phone}</p>
        </div>
        <div>
          <p><strong className="text-gray-600">Dirección:</strong> {delivery.address}</p>
          <p><strong className="text-gray-600">Fecha:</strong> {delivery.date}</p>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded-lg shadow-sm">
          <thead className="bg-muted text-gray-700 font-semibold">
            <tr>
              <th className="px-4 py-2 border">Código</th>
              <th className="px-4 py-2 border">Descripción</th>
              <th className="px-4 py-2 border">Almacén</th>
              <th className="px-4 py-2 border">Cantidad</th>
              <th className="px-4 py-2 border">Precio ({selectedCurrencySymbol})</th>
              <th className="px-4 py-2 border">Subtotal ({selectedCurrencySymbol})</th>
            </tr>
          </thead>
          <tbody>
            {delivery.items.map((item, idx) => {
              const part = item.isService ? null : getPartDetails(item.id);
              return (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{item.isService ? 'N/A' : (part?.partNumber || 'N/A')}</td>
                  <td className="px-4 py-2 border">{item.name}</td>
                  <td className="px-4 py-2 border">
                    {item.isService ? 'Servicio' : (warehouses.find(w => w.id === item.warehouseId)?.name || 'N/A')}
                  </td>
                  <td className="px-4 py-2 border text-center">{item.quantity}</td>
                  <td className="px-4 py-2 border text-right">{item.price.toFixed(2)}</td>
                  <td className="px-4 py-2 border text-right">{(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="text-right text-lg sm:text-xl font-bold text-dark mt-6">
        Total: {selectedCurrencySymbol}{totalDelivery.toFixed(2)}
      </div>
    </div>
  );
};

export default DeliveryDocument;
