import React, { useEffect, useState } from 'react';
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
        await fetch(`http://localhost:3001/api/products/${id}`, { method: 'DELETE' });
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
      return sortAsc
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-3xl font-bold text-dark mb-6">📦 Inventario de Repuestos</h1>

      {viewMode === 'form' ? (
        <InventoryActions
          selectedPart={selectedPart}
          onSave={() => handleSavePart()}
          onCancel={() => handleCancel()}
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="🔍 Buscar código, nombre o marca"
                className="input-style"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="input-style"
              >
                <option value="all">Todos los Almacenes</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              <button
                onClick={() => {
                  setViewMode('form');
                  setSelectedPart(null);
                }}
                className="btn-green"
              >
                + Nuevo Repuesto
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('http://localhost:3001/api/products/export/excel');
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'inventario.xlsx';
                    a.click();
                    window.URL.revokeObjectURL(url);
                  } catch (err) {
                    console.error('Error al exportar:', err);
                    alert('Error exportando inventario.');
                  }
                }}
                className="btn-blue"
              >
                📥 Exportar Excel
              </button>
            </div>
          </div>

          <div className="overflow-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm divide-y divide-gray-100">
              <thead className="bg-muted text-dark font-semibold">
                <tr>
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
                  ].map(col => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="cursor-pointer px-3 py-2 text-left hover:underline"
                    >
                      {col.label} {sortBy === col.key ? (sortAsc ? '▲' : '▼') : ''}
                    </th>
                  ))}
                  <th className="px-3 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAndSortedParts.map((part) => (
                  <tr key={part.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{part.partNumber}</td>
                    <td className="px-3 py-2">{part.name}</td>
                    <td className="px-3 py-2">{part.brand}</td>
                    <td className="px-3 py-2">{part.model || '-'}</td>
                    <td className="px-3 py-2">{(part.compatibleModels || []).join(', ')}</td>
                    <td className="px-3 py-2">{part.location || '-'}</td>
                    <td className="px-3 py-2">{part.warehouseId || '-'}</td>
                    <td className="px-3 py-2">{part.stock}</td>
                    <td className="px-3 py-2">${part.price?.toFixed(2)}</td>
                    <td className="px-3 py-2">${part.cost?.toFixed(2)}</td>
                    <td className="px-3 py-2 flex gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          setSelectedPart(part);
                          setViewMode('form');
                        }}
                        className="btn-yellow"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeletePart(part.id)}
                        className="btn-red"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 font-semibold text-right text-dark">
            Total invertido: <span className="text-green-600">${totalInvestment.toFixed(2)}</span>
          </p>
        </>
      )}
    </div>
  );
};

export default InventoryView;
