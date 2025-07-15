import React, { useState, useEffect } from 'react';
import { getStorage, setStorage } from '../utils/storage';
import { clients as initialClients } from '../mock/clients';

const ClientsView = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [selectedClient, setSelectedClient] = useState(null);

  const [clientName, setClientName] = useState('');
  const [clientRif, setClientRif] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  useEffect(() => {
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
    const updatedClients = selectedClient
      ? currentClients.map(c => c.id === newClient.id ? newClient : c)
      : [...currentClients, newClient];

    setStorage('clients', updatedClients);
    loadClients();
  };

  const handleDeleteClient = (id) => {
    if (window.confirm('¿Eliminar este cliente?')) {
      const updated = getStorage('clients').filter(c => c.id !== id);
      setStorage('clients', updated);
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
      <div className="p-6 bg-white rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {selectedClient ? '✏️ Modificar Cliente' : '🆕 Nuevo Cliente'}
        </h2>
        <form onSubmit={handleAddEditClient} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold mb-1">Nombre</label>
            <input className="input-style" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">RIF</label>
            <input className="input-style" value={clientRif} onChange={(e) => setClientRif(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Teléfono</label>
            <input className="input-style" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} required />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold mb-1">Dirección</label>
            <textarea className="input-style resize-none" rows="3" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} required />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" onClick={loadClients} className="btn-gray">Cancelar</button>
            <button type="submit" className="btn-blue">
              {selectedClient ? 'Guardar Cambios' : 'Agregar Cliente'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">👥 Clientes</h2>
        <button onClick={() => setViewMode('add')} className="btn-blue">
          ➕ Agregar Cliente
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar por nombre o RIF..."
        className="input-style mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-sm divide-y divide-gray-100">
          <thead className="bg-gray-50 text-gray-700 font-semibold">
            <tr>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">RIF</th>
              <th className="px-4 py-2 text-left">Teléfono</th>
              <th className="px-4 py-2 text-left">Dirección</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{client.name}</td>
                <td className="px-4 py-2">{client.rif}</td>
                <td className="px-4 py-2">{client.phone}</td>
                <td className="px-4 py-2">{client.address}</td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleEditClick(client)} className="text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => handleDeleteClient(client.id)} className="text-red-600 hover:underline">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredClients.length === 0 && (
          <p className="text-center text-gray-500 py-4">No se encontraron clientes.</p>
        )}
      </div>
    </div>
  );
};

export default ClientsView;
