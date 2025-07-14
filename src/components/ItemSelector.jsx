import React, { useState, useEffect } from 'react';
import { getStorage } from '../utils/storage';
import { warehouses } from '../mock/warehouses';

const ItemSelector = ({ onAddItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [availableParts, setAvailableParts] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  // No necesitamos selectedQuantity global, cada item tendrá su propia cantidad en el input

  useEffect(() => {
    setAvailableParts(getStorage('truckParts'));
  }, []);

  const filteredParts = availableParts.filter(part =>
    (selectedWarehouse === 'all' || part.warehouseId === selectedWarehouse) &&
    (part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddItemClick = (part, quantity) => { // Recibe la cantidad específica del input
    if (quantity > 0 && quantity <= part.stock) {
      onAddItem({
        id: part.id,
        name: part.name,
        partNumber: part.partNumber,
        price: part.price,
        cost: part.cost,
        quantity: quantity, // Usa la cantidad recibida
        warehouseId: part.warehouseId
      });
      // No resetear searchTerm aquí para permitir búsqueda continua
    } else {
      alert(`Cantidad inválida o stock insuficiente para ${part.name} en ${warehouses.find(w => w.id === part.warehouseId)?.name}. Stock disponible: ${part.stock}`);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <h3 className="text-lg font-semibold mb-3">Agregar Artículos del Inventario</h3>
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-3">
        <input
          type="text"
          placeholder="Buscar artículo por descripción o código..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(e.target.value)}
        >
          <option value="all">Todos los Almacenes</option>
          {warehouses.map(warehouse => (
            <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
          ))}
        </select>
      </div>
      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
        {filteredParts.length === 0 && searchTerm !== '' ? (
          <p className="p-3 text-gray-500">No se encontraron artículos.</p>
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

// Componente auxiliar para cada fila de artículo
const ItemRow = ({ part, onAddItem }) => {
  const [quantity, setQuantity] = useState(1); // Estado local para la cantidad de cada fila

  return (
    <li className="p-3 hover:bg-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div>
        <p className="font-medium">{part.name} ({part.partNumber})</p>
        <p className="text-sm text-gray-600">Almacén: {warehouses.find(w => w.id === part.warehouseId)?.name} | Stock: {part.stock} | Precio: ${part.price.toFixed(2)} | Costo: ${part.cost ? part.cost.toFixed(2) : 'N/A'}</p>
      </div>
      <div className="flex items-center space-x-2 mt-2 sm:mt-0">
        <input
          type="number"
          min="1"
          max={part.stock}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          className="w-20 px-2 py-1 border border-gray-300 rounded-md text-center"
        />
        <button
          onClick={() => onAddItem(part, quantity)} // Pasa la cantidad local
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
        >
          Agregar
        </button>
      </div>
    </li>
  );
};

export default ItemSelector;


// DONE