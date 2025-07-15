import React, { useState, useEffect } from 'react';
import { warehouses } from '../mock/warehouses';

const InventoryActions = ({ selectedPart, onSave, onCancel }) => {
  const [partNumber, setPartNumber] = useState('');
  const [description, setDescription] = useState('');
  const [compatibleModels, setCompatibleModels] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('');
  const [location, setLocation] = useState('');
  const [model, setModel] = useState('');
  const [warehouseId, setWarehouseId] = useState(warehouses[0].id);

  useEffect(() => {
    if (selectedPart) {
      setPartNumber(selectedPart.partNumber || '');
      setDescription(selectedPart.name || '');
      setCompatibleModels((selectedPart.compatibleModels || []).join(', '));
      setBrand(selectedPart.brand || '');
      setPrice(selectedPart.price || '');
      setCost(selectedPart.cost || '');
      setStock(selectedPart.stock || '');
      setLocation(selectedPart.location || '');
      setModel(selectedPart.model || '');
      setWarehouseId(selectedPart.warehouseId || warehouses[0].id);
    } else {
      setPartNumber('');
      setDescription('');
      setCompatibleModels('');
      setBrand('');
      setPrice('');
      setCost('');
      setStock('');
      setLocation('');
      setModel('');
      setWarehouseId(warehouses[0].id);
    }
  }, [selectedPart]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newPart = {
      partNumber,
      name: description,
      compatibleModels: compatibleModels.split(',').map(m => m.trim()).filter(m => m !== ''),
      brand,
      price: parseFloat(price),
      cost: parseFloat(cost),
      stock: parseInt(stock),
      location,
      model,
      warehouseId,
    };

    try {
      const url = selectedPart
        ? `http://localhost:3001/api/products/${selectedPart.id}`
        : `http://localhost:3001/api/products`;

      const method = selectedPart ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPart),
      });

      if (!response.ok) throw new Error('Error al guardar los datos del producto');

      onSave(newPart);
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      alert('Error al guardar. Revisa la consola para más detalles.');
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">
        {selectedPart ? 'Modificar Repuesto' : 'Agregar Nuevo Repuesto'}
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label htmlFor="partNumber">Código</label>
          <input type="text" id="partNumber" className="input-style" value={partNumber} onChange={(e) => setPartNumber(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="description">Descripción</label>
          <input type="text" id="description" className="input-style" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="brand">Marca</label>
          <input type="text" id="brand" className="input-style" value={brand} onChange={(e) => setBrand(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="model">Modelo</label>
          <input type="text" id="model" className="input-style" value={model} onChange={(e) => setModel(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="compatibleModels">Modelos Compatibles (separados por coma)</label>
          <input type="text" id="compatibleModels" className="input-style" value={compatibleModels} onChange={(e) => setCompatibleModels(e.target.value)} />
        </div>
        <div>
          <label htmlFor="price">Precio</label>
          <input type="number" id="price" step="0.01" className="input-style" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="cost">Costo</label>
          <input type="number" id="cost" step="0.01" className="input-style" value={cost} onChange={(e) => setCost(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="stock">Stock</label>
          <input type="number" id="stock" className="input-style" value={stock} onChange={(e) => setStock(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="location">Ubicación</label>
          <input type="text" id="location" className="input-style" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div>
          <label htmlFor="warehouse">Almacén</label>
          <select id="warehouse" className="input-style" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} required>
            {warehouses.map(warehouse => (
              <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
          <button type="button" onClick={onCancel} className="btn-gray">
            Cancelar
          </button>
          <button type="submit" className="btn-blue">
            {selectedPart ? 'Guardar Cambios' : 'Agregar Repuesto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryActions;
