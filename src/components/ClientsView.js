import React, { useState, useEffect } from 'react';
import { getStorage, setStorage } from '../utils/storage';
import { clients as initialClients } from '../mock/clients';

const ClientsView = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'add', 'edit'
  const [selectedClient, setSelectedClient] = useState(null);

  const [clientName, setClientName] = useState('');
  const [clientRif, setClientRif] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  useEffect(() => {
    // Inicializar clientes si no existen en el almacenamiento
    if (getStorage('clients').length === 0) {
      setStorage('clients', initialClients);
    }
    loadClients();
  }, []);

  const loadClients = () => {
    setClients(getStorage('clients'));
    setViewMode('list');
    setSelectedClient(null);
    resetForm();
  };

  const resetForm = () => {
    setClientName('');
    setClientRif('');
    setClientPhone('');
    setClientAddress('');
  };

  const handleAddEditClient = (e) => {
    e.preventDefault();
    const newClient = {
      id: selectedClient ? selectedClient.id : Date.now(),
      name: clientName,
      rif: clientRif,
      phone: clientPhone,
      address: clientAddress,
    };

    const currentClients = getStorage('clients');
    let updatedClients;
    if (selectedClient) {
      updatedClients = currentClients.map(client => client.id === newClient.id ? newClient : client);
    } else {
      updatedClients = [...currentClients, newClient];
    }
    setStorage('clients', updatedClients);
    loadClients();
  };

  const handleDeleteClient = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      const currentClients = getStorage('clients');
      const updatedClients = currentClients.filter(client => client.id !== id);
      setStorage('clients', updatedClients);
      loadClients();
    }
  };

  const handleEditClick = (client) => {
    setSelectedClient(client);
    setClientName(client.name);
    setClientRif(client.rif);
    setClientPhone(client.phone);
    setClientAddress(client.address);
    setViewMode('edit');
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.rif.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (viewMode === 'add' || viewMode === 'edit') {
    return (
      <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">{selectedClient ? 'Modificar Cliente' : 'Agregar Nuevo Cliente'}</h2>
        <form onSubmit={handleAddEditClient} className="space-y-4">
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">Nombre del Cliente</label>
            <input type="text" id="clientName" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="clientRif" className="block text-sm font-medium text-gray-700">RIF</label>
            <input type="text" id="clientRif" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={clientRif} onChange={(e) => setClientRif(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input type="tel" id="clientPhone" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="clientAddress" className="block text-sm font-medium text-gray-700">Dirección</label>
            <textarea id="clientAddress" rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} required></textarea>
          </div>
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
            <button type="button" onClick={loadClients} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              Cancelar
            </button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              {selectedClient ? 'Guardar Cambios' : 'Agregar Cliente'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-0">Gestión de Clientes</h2>
        <button
          onClick={() => setViewMode('add')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
        >
          Agregar Nuevo Cliente
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar cliente por nombre o RIF..."
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
              <th className="py-2 px-4 border-b">RIF</th>
              <th className="py-2 px-4 border-b">Teléfono</th>
              <th className="py-2 px-4 border-b">Dirección</th>
              <th className="py-2 px-4 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b text-sm">{client.name}</td>
                <td className="py-2 px-4 border-b text-sm">{client.rif}</td>
                <td className="py-2 px-4 border-b text-sm">{client.phone}</td>
                <td className="py-2 px-4 border-b text-sm">{client.address}</td>
                <td className="py-2 px-4 border-b text-sm flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => handleEditClick(client)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteClient(client.id)}
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
      {filteredClients.length === 0 && (
        <p className="text-center text-gray-500 mt-4">No se encontraron clientes.</p>
      )}
    </div>
  );
};

export default ClientsView;