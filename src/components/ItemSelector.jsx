import React, { useState, useEffect } from 'react';
import { getStorage } from '../utils/storage';
import { warehouses } from '../mock/warehouses';

const ItemSelector = ({ onAddItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [availableParts, setAvailableParts] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');

  useEffect(() => {
    setAvailableParts(getStorage('truckParts'));
  }, []);

  const filteredParts = availableParts.filter(part =>
    (selectedWarehouse === 'all' || part.warehouseId === selectedWarehouse) &&
    (part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddItemClick = (part, quantity) => {
    if (quantity > 0 && quantity <= part.stock) {
      onAddItem({
        id: part.id,
        name: part.name,
        partNumber: part.partNumber,
        price: part.price,
        cost: part.cost,
        quantity,
        warehouseId: part.warehouseId
      });
    } else {
      alert(`Cantidad inválida o stock insuficiente para ${part.name}. Stock disponible: ${part.stock}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">📦 Buscar y Agregar Artículos</h3>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="🔍 Buscar por descripción o código..."
          className="input-style"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="input-style sm:w-64"
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(e.target.value)}
        >
          <option value="all">Todos los Almacenes</option>
          {warehouses.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      <div className="max-h-64 overflow-y-auto border rounded-lg">
        {filteredParts.length === 0 && searchTerm !== '' ? (
          <p className="p-4 text-gray-500 text-center">No se encontraron resultados.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredParts.map(part => (
              <ItemRow key={part.id} part={part} onAddItem={handleAddItemClick} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const ItemRow = ({ part, onAddItem }) => {
  const [quantity, setQuantity] = useState(1);

  return (
    <li className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition">
      <div>
        <p className="font-semibold text-gray-800">{part.name} <span className="text-sm text-gray-500">({part.partNumber})</span></p>
        <p className="text-sm text-gray-600 mt-1">
          Almacén: {warehouses.find(w => w.id === part.warehouseId)?.name} | Stock: {part.stock} | 💲 Precio: ${part.price.toFixed(2)} | Costo: ${part.cost?.toFixed(2) ?? 'N/A'}
        </p>
      </div>
      <div className="flex items-center gap-2 mt-3 sm:mt-0">
        <input
          type="number"
          min="1"
          max={part.stock}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          className="w-20 input-style text-center"
        />
        <button
          onClick={() => onAddItem(part, quantity)}
          className="btn-blue text-sm"
        >
          Agregar
        </button>
      </div>
    </li>
  );
};

export default ItemSelector;
