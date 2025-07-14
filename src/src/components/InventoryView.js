import React, { useState, useEffect } from 'react';
import InventoryActions from './InventoryActions';
import { warehouses } from '../mock/warehouses';

const InventoryView = () => {
  const [parts, setParts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [selectedPart, setSelectedPart] = useState(null);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [sortBy, setSortBy] = useState('partNumber');
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    fetchParts();
  }, []);

  useEffect(() => {
    calculateTotalInvestment();
  }, [parts, selectedWarehouse]);

  const fetchParts = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/products');
      const data = await res.json();
      setParts(data);
      setViewMode('list');
      setSelectedPart(null);
    } catch (error) {
      console.error("Error al cargar partes desde el backend:", error);
    }
  };

  const calculateTotalInvestment = () => {
    let investment = 0;
    const filteredParts = selectedWarehouse === 'all'
      ? parts
      : parts.filter(part => part.warehouseId === selectedWarehouse);

    filteredParts.forEach(part => {
      if (part.price && part.stock) {
        investment += part.price * part.stock;
      }
    });

    setTotalInvestment(investment);
  };

  const handleDeletePart = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta pieza?')) {
      try {
        await fetch(`http://localhost:3001/api/products/${id}`, {
          method: 'DELETE',
        });
        fetchParts();
      } catch (error) {
        console.error('Error al eliminar la pieza:', error);
      }
    }
  };

  const handleSavePart = () => {
    fetchParts();
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedPart(null);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(column);
      setSortAsc(true);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/products/export/excel');

      if (!response.ok) throw new Error('Error al descargar el Excel');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'inventario.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('No se pudo exportar el inventario. Revisa la consola.');
    }
  };

  const filteredAndSortedParts = parts
    .filter(part => {
      const matchesSearch =
        part.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.brand?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesWarehouse =
        selectedWarehouse === 'all' || part.warehouseId === selectedWarehouse;

      return matchesSearch && matchesWarehouse;
    })
    .sort((a, b) => {
      const valA = a[sortBy]?.toString().toLowerCase() || '';
      const valB = b[sortBy]?.toString().toLowerCase() || '';

      if (!isNaN(valA) && !isNaN(valB)) {
        return sortAsc ? valA - valB : valB - valA;
      }

      return sortAsc
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Inventario de Repuestos</h1>

      {viewMode === 'form' ? (
        <InventoryActions
          selectedPart={selectedPart}
          onSave={handleSavePart}
          onCancel={handleCancel}
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 items-center w-full sm:w-auto">
              <input
                type="text"
                placeholder="Buscar por código, nombre o marca"
                className="w-full sm:w-64 px-4 py-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="px-4 py-2 border rounded-md"
              >
                <option value="all">Todos los Almacenes</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setViewMode('form');
                  setSelectedPart(null);
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                + Agregar Nuevo Repuesto
              </button>

              <button
                onClick={handleExportExcel}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                📥 Exportar Excel
              </button>
            </div>
          </div>

          <table className="w-full table-auto border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                {[
                  { label: 'Código', key: 'partNumber' },
                  { label: 'Nombre', key: 'name' },
                  { label: 'Marca', key: 'brand' },
                  { label: 'Modelo', key: 'model' },
                  { label: 'Compatibles', key: 'compatibleModels' },
                  { label: 'Ubicación', key: 'location' },
                  { label: 'Almacén', key: 'warehouseId' },
                  { label: 'Stock', key: 'stock' },
                  { label: 'Precio', key: 'price' },
                  { label: 'Costo', key: 'cost' },
                ].map((col) => (
                  <th
                    key={col.key}
                    className="border px-4 py-2 cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                    {sortBy === col.key ? (sortAsc ? ' ▲' : ' ▼') : ''}
                  </th>
                ))}
                <th className="border px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedParts.map((part) => (
                <tr key={part.id}>
                  <td className="border px-4 py-2">{part.partNumber}</td>
                  <td className="border px-4 py-2">{part.name}</td>
                  <td className="border px-4 py-2">{part.brand}</td>
                  <td className="border px-4 py-2">{part.model || '-'}</td>
                  <td className="border px-4 py-2">
                    {(part.compatibleModels || []).join(', ') || '-'}
                  </td>
                  <td className="border px-4 py-2">{part.location || '-'}</td>
                  <td className="border px-4 py-2">{part.warehouseId || '-'}</td>
                  <td className="border px-4 py-2">{part.stock}</td>
                  <td className="border px-4 py-2">${part.price?.toFixed(2)}</td>
                  <td className="border px-4 py-2">${part.cost?.toFixed(2)}</td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      onClick={() => {
                        setSelectedPart(part);
                        setViewMode('form');
                      }}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-1 px-3 rounded"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeletePart(part.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-4 font-semibold">
            Total invertido: ${totalInvestment.toFixed(2)}
          </p>
        </>
      )}
    </div>
  );
};

export default InventoryView;
