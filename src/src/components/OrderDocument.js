import React from 'react';
import PrintButton from './PrintButton';

const OrderDocument = ({ order }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md print:p-0 print:shadow-none">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-xl font-bold">Pedido #{order.id}</h2>
        <PrintButton documentId={order.id} documentType="Pedido" />
      </div>
      
      <div className="mb-4">
        <p><span className="font-semibold">Proveedor:</span> {order.supplier}</p>
        <p><span className="font-semibold">Fecha:</span> {order.date}</p>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left border">N° Parte</th>
            <th className="p-2 text-left border">Repuesto</th>
            <th className="p-2 text-left border">Cantidad</th>
            <th className="p-2 text-left border">Precio Unitario</th>
            <th className="p-2 text-left border">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="p-2 border">{item.partNumber}</td>
              <td className="p-2 border">{item.name}</td>
              <td className="p-2 border">{item.quantity}</td>
              <td className="p-2 border">${item.unitPrice.toFixed(2)}</td>
              <td className="p-2 border">${(item.quantity * item.unitPrice).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        @media print {
          .print-hidden {
            display: none;
          }
          body {
            font-size: 12pt;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderDocument;


// DONE