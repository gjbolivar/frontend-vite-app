import React, { useState, useEffect } from 'react';
import { getStorage, setStorage } from '../utils/storage';
import { sellers as initialSellers } from '../mock/sellers';

const SellersView = () => {
  const [sellers, setSellers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'add', 'edit'
  const [selectedSeller, setSelectedSeller] = useState(null);

  const [sellerName, setSellerName] = useState('');

  useEffect(() => {
    // Inicializar vendedores si no existen en el almacenamiento
    if (getStorage('sellers').length === 0) {
      setStorage('sellers', initialSellers);
    }
    loadSellers();
  }, []);

  const loadSellers = () => {
    setSellers(getStorage('sellers'));
    setViewMode('list');
    setSelectedSeller(null);
    resetForm();
  };

  const resetForm = () => {
    setSellerName('');
  };

  const handleAddEditSeller = (e) => {
    e.preventDefault();
    if (!sellerName.trim()) {
      alert('El nombre del vendedor no puede estar vacío.');
      return;
    }

    const newSeller = {
      id: selectedSeller ? selectedSeller.id : Date.now(),
      name: sellerName.trim(),
    };

    const currentSellers = getStorage('sellers');
    let updatedSellers;
    if (selectedSeller) {
      updatedSellers = currentSellers.map(seller => seller.id === newSeller.id ? newSeller : seller);
    } else {
      updatedSellers = [...currentSellers, newSeller];
    }
    setStorage('sellers', updatedSellers);
    loadSellers();
  };

  const handleDeleteSeller = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este vendedor?')) {
      const currentSellers = getStorage('sellers');
      const updatedSellers = currentSellers.filter(seller => seller.id !== id);
      setStorage('sellers', updatedSellers);
      loadSellers();
    }
  };

  const handleEditClick = (seller) => {
    setSelectedSeller(seller);
    setSellerName(seller.name);
    setViewMode('edit');
  };

  const filteredSellers = sellers.filter(seller =>
    seller.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (viewMode === 'add' || viewMode === 'edit') {
    return (
      <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">{selectedSeller ? 'Modificar Vendedor' : 'Agregar Nuevo Vendedor'}</h2>
        <form onSubmit={handleAddEditSeller} className="space-y-4">
          <div>
            <label htmlFor="sellerName" className="block text-sm font-medium text-gray-700">Nombre del Vendedor</label>
            <input type="text" id="sellerName" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={sellerName} onChange={(e) => setSellerName(e.target.value)} required />
          </div>
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
            <button type="button" onClick={loadSellers} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              Cancelar
            </button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              {selectedSeller ? 'Guardar Cambios' : 'Agregar Vendedor'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-0">Gestión de Vendedores</h2>
        <button
          onClick={() => setViewMode('add')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
        >
          Agregar Nuevo Vendedor
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar vendedor por nombre..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
              <th className="py-2 px-4 border-b">Nombre</th>
              <th className="py-2 px-4 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredSellers.map((seller) => (
              <tr key={seller.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b text-sm">{seller.name}</td>
                <td className="py-2 px-4 border-b text-sm flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => handleEditClick(seller)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteSeller(seller.id)}
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
      {filteredSellers.length === 0 && (
        <p className="text-center text-gray-500 mt-4">No se encontraron vendedores.</p>
      )}
    </div>
  );
};

export default SellersView;