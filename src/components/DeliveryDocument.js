import React from 'react';
import PrintButton from './PrintButton';
import { getPartDetails } from '../utils/inventoryUtils';
import { warehouses } from '../mock/warehouses';
import { currencies } from '../mock/currencies';
import { updateStock } from '../utils/inventoryUtils'; // Importar updateStock
import { getStorage, setStorage } from '../utils/storage'; // Importar getStorage y setStorage

const DeliveryDocument = ({ delivery, onBackToList }) => {
  const totalDelivery = delivery.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const selectedCurrencySymbol = currencies.find(c => c.id === delivery.currency)?.symbol || '$';

  const handleReturnToStock = () => {
    if (window.confirm('¿Estás seguro de que quieres devolver esta Cotización Aprobada al stock? Esta acción no se puede deshacer.')) {
      // Reingresar los artículos al stock
      updateStock(delivery.items, 'add');

      // Marcar la cotización aprobada como devuelta (opcional, para registro)
      const currentDeliveries = getStorage('deliveries');
      const updatedDeliveries = currentDeliveries.map(d =>
        d.id === delivery.id ? { ...d, status: 'devuelta' } : d
      );
      setStorage('deliveries', updatedDeliveries);

      alert('Artículos devueltos al stock correctamente.');
      onBackToList(); // Volver a la lista después de la devolución
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md print:p-0 print:shadow-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 print:hidden">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-0">Cotización Aprobada #{delivery.id}</h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <PrintButton documentId={delivery.id} documentType="Cotización Aprobada" />
          {delivery.status !== 'devuelta' && ( // Mostrar botón de devolución solo si no ha sido devuelta
            <button
              onClick={handleReturnToStock}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414L7.5 9.086 6.207 7.793a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Devolución
            </button>
          )}
          <button
            onClick={onBackToList}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver
          </button>
        </div>
      </div>
      
      {/* Contenido para impresión */}
      <div className="print:block hidden print:text-black print:font-sans print:text-sm">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-xl font-bold">COTIZACIÓN APROBADA</h1>
          <div className="text-right">
            <p className="font-bold text-lg">N° COTIZACIÓN APROBADA: {delivery.id}</p>
            <p>Fecha: {delivery.date}</p>
          </div>
        </div>

        <div className="border border-gray-400 p-4 mb-6">
          <p className="font-bold mb-2">Datos del Cliente:</p>
          <p><strong>Nombre:</strong> {delivery.client}</p>
          <p><strong>RIF:</strong> {delivery.rif}</p>
          <p><strong>Teléfono:</strong> {delivery.phone}</p>
          <p><strong>Dirección:</strong> {delivery.address}</p>
        </div>

        {delivery.items.length > 0 && (
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left border border-gray-400">Código</th>
                <th className="p-2 text-left border border-gray-400">Descripción</th>
                <th className="p-2 text-left border border-gray-400">Almacén/Tipo</th>
                <th className="p-2 text-left border border-gray-400">Cantidad</th>
                <th className="p-2 text-left border border-gray-400">Precio Unitario ({selectedCurrencySymbol})</th>
                <th className="p-2 text-left border border-gray-400">Total ({selectedCurrencySymbol})</th>
              </tr>
            </thead>
            <tbody>
              {delivery.items.map((item, index) => {
                const part = item.isService ? null : getPartDetails(item.id);
                return (
                  <tr key={index}>
                    <td className="p-2 border border-gray-400">{item.isService ? 'N/A' : (part ? part.partNumber : 'N/A')}</td>
                    <td className="p-2 border border-gray-400">{item.name}</td>
                    <td className="p-2 border border-gray-400">{item.isService ? 'Servicio' : (warehouses.find(w => w.id === item.warehouseId)?.name || 'N/A')}</td>
                    <td className="p-2 border border-gray-400">{item.quantity}</td>
                    <td className="p-2 border border-gray-400">{selectedCurrencySymbol}{item.price.toFixed(2)}</td>
                    <td className="p-2 border border-gray-400">{selectedCurrencySymbol}{(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="text-right text-lg font-bold">
          Total: {selectedCurrencySymbol}{totalDelivery.toFixed(2)}
        </div>
      </div>

      {/* Contenido para visualización en pantalla */}
      <div className="print:hidden">
        <div className="mb-4 border-b pb-4 text-sm sm:text-base">
          <p><span className="font-semibold">Cliente:</span> {delivery.client}</p>
          <p><span className="font-semibold">RIF:</span> {delivery.rif}</p>
          <p><span className="font-semibold">Teléfono:</span> {delivery.phone}</p>
          <p><span className="font-semibold">Dirección:</span> {delivery.address}</p>
          <p><span className="font-semibold">Fecha:</span> {delivery.date}</p>
        </div>

        {delivery.items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                  <th className="py-2 px-4 border-b">Código</th>
                  <th className="py-2 px-4 border-b">Descripción</th>
                  <th className="py-2 px-4 border-b">Almacén</th>
                  <th className="py-2 px-4 border-b">Cantidad</th>
                  <th className="py-2 px-4 border-b">Precio Unitario ({selectedCurrencySymbol})</th>
                  <th className="py-2 px-4 border-b">Total ({selectedCurrencySymbol})</th>
                </tr>
              </thead>
              <tbody>
                {delivery.items.map((item, index) => {
                  const part = item.isService ? null : getPartDetails(item.id);
                  return (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-4 border-b text-sm">{item.isService ? 'N/A' : (part ? part.partNumber : 'N/A')}</td>
                      <td className="py-2 px-4 border-b text-sm">{item.name}</td>
                      <td className="py-2 px-4 border-b text-sm">{item.isService ? 'Servicio' : (warehouses.find(w => w.id === item.warehouseId)?.name || 'N/A')}</td>
                      <td className="py-2 px-4 border-b text-sm">{item.quantity}</td>
                      <td className="py-2 px-4 border-b text-sm">{selectedCurrencySymbol}{item.price.toFixed(2)}</td>
                      <td className="py-2 px-4 border-b text-sm">{selectedCurrencySymbol}{(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-right text-lg sm:text-xl font-bold mt-4">
          Total: {selectedCurrencySymbol}{totalDelivery.toFixed(2)}
        </div>
      </div>

      <style jsx>{`
        @media print {
          .print-hidden {
            display: none;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:text-black {
            color: black !important;
          }
          .print\\:font-sans {
            font-family: sans-serif !important;
          }
          .print\\:text-sm {
            font-size: 0.875rem !important; /* 14px */
          }
          /* Asegurar que las tablas y bordes se vean bien en impresión */
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f0f0f0;
          }
        }
      `}</style>
    </div>
  );
};

export default DeliveryDocument;