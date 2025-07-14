import React, { useState, useEffect } from 'react';
import { getStorage, setStorage } from '../utils/storage';
import ItemSelector from './ItemSelector';
import { warehouses } from '../mock/warehouses';
import { currencies } from '../mock/currencies';
import { clients as initialClients } from '../mock/clients';
import { sellers as initialSellers } from '../mock/sellers';

const QuoteForm = ({ onSave, onCancel, initialQuote }) => {
  const [clientName, setClientName] = useState('');
  const [clientRif, setClientRif] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [quoteItems, setQuoteItems] = useState([]);
  const [quoteId, setQuoteId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('contado');
  const [currency, setCurrency] = useState(currencies[0].id);
  const [sellerId, setSellerId] = useState('');

  const [manualDescription, setManualDescription] = useState('');
  const [manualQuantity, setManualQuantity] = useState(1);
  const [manualPrice, setManualPrice] = useState('');

  const [clients, setClients] = useState([]);

  useEffect(() => {
    if (getStorage('clients').length === 0) {
      setStorage('clients', initialClients);
    }
    setClients(getStorage('clients'));

    if (getStorage('sellers').length === 0) {
      setStorage('sellers', initialSellers);
    }

    if (initialQuote) {
      setQuoteId(initialQuote.id);
      setClientName(initialQuote.client);
      setClientRif(initialQuote.rif);
      setClientPhone(initialQuote.phone);
      setClientAddress(initialQuote.address);
      setQuoteItems(initialQuote.items);
      setPaymentMethod(initialQuote.paymentMethod || 'contado');
      setCurrency(initialQuote.currency || currencies[0].id);
      setSellerId(initialQuote.sellerId || '');
      const clientExists = getStorage('clients').find(c => c.name === initialQuote.client && c.rif === initialQuote.rif);
      if (clientExists) {
        // No es necesario setear selectedClientId aquí, ya que los campos de cliente se llenan directamente
      }
    } else {
      setQuoteId(null);
      setClientName('');
      setClientRif('');
      setClientPhone('');
      setClientAddress('');
      setQuoteItems([]);
      setPaymentMethod('contado');
      setCurrency(currencies[0].id);
      setSellerId('');
    }
  }, [initialQuote]);

  const handleClientSelect = (e) => {
    const clientId = e.target.value;
    if (clientId) {
      const client = clients.find(c => c.id === parseInt(clientId));
      if (client) {
        setClientName(client.name);
        setClientRif(client.rif);
        setClientPhone(client.phone);
        setClientAddress(client.address);
      }
    } else {
      setClientName('');
      setClientRif('');
      setClientPhone('');
      setClientAddress('');
    }
  };

  const getNextDocumentNumber = (keyPrefix) => {
    const lastNumber = getStorage(keyPrefix) || 999;
    const nextNumber = lastNumber + 1;
    setStorage(keyPrefix, nextNumber);
    return nextNumber;
  };

  const handleAddItem = (item) => {
    setQuoteItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(i => i.id === item.id && i.warehouseId === item.warehouseId);
      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += item.quantity;
        return newItems;
      }
      return [...prevItems, item];
    });
    // No hay necesidad de cerrar el ItemSelector aquí, ya que es un componente hijo
    // y su estado de búsqueda y cantidad se maneja internamente o se resetea si se desea.
  };

  const handleAddManualItem = () => {
    if (!manualDescription || manualQuantity <= 0 || manualPrice <= 0) {
      alert('Por favor, ingresa una descripción, cantidad y precio válidos para el servicio.');
      return;
    }
    const newItem = {
      id: `manual-${Date.now()}`,
      name: manualDescription,
      partNumber: 'N/A',
      price: parseFloat(manualPrice),
      quantity: parseInt(manualQuantity),
      warehouseId: 'N/A',
      isService: true
    };
    setQuoteItems(prevItems => [...prevItems, newItem]);
    setManualDescription('');
    setManualQuantity(1);
    setManualPrice('');
  };

  const handleRemoveItem = (itemId, warehouseId) => {
    setQuoteItems(prevItems => prevItems.filter(item => !(item.id === itemId && item.warehouseId === warehouseId)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (quoteItems.length === 0) {
      alert('Debe agregar al menos un artículo o servicio a la cotización.');
      return;
    }
    if (!sellerId) {
      alert('Por favor, selecciona un vendedor.');
      return;
    }

    const newQuote = {
      id: quoteId || getNextDocumentNumber('lastQuoteNumber'),
      client: clientName,
      rif: clientRif,
      phone: clientPhone,
      address: clientAddress,
      date: initialQuote ? initialQuote.date : new Date().toISOString().split('T')[0],
      items: quoteItems,
      paymentMethod,
      currency,
      sellerId
    };

    const currentQuotes = getStorage('quotes');
    let updatedQuotes;
    if (initialQuote) {
      updatedQuotes = currentQuotes.map(q => q.id === newQuote.id ? newQuote : q);
    } else {
      updatedQuotes = [...currentQuotes, newQuote];
    }
    setStorage('quotes', updatedQuotes);
    
    onSave(newQuote);
    
    setClientName('');
    setClientRif('');
    setClientPhone('');
    setClientAddress('');
    setQuoteItems([]);
    setPaymentMethod('contado');
    setCurrency(currencies[0].id);
    setSellerId('');
  };

  const totalQuote = quoteItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const selectedCurrencySymbol = currencies.find(c => c.id === currency)?.symbol || '$';
  const sellers = getStorage('sellers');

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">{initialQuote ? `Editar Cotización #${initialQuote.id}` : 'Crear Nueva Cotización'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="selectClient" className="block text-sm font-medium text-gray-700">Seleccionar Cliente Existente</label>
          <select
            id="selectClient"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={clients.find(c => c.name === clientName && c.rif === clientRif)?.id || ''}
            onChange={handleClientSelect}
          >
            <option value="">-- Seleccionar o Añadir Nuevo --</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name} ({client.rif})</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">Nombre del Cliente</label>
          <input
            type="text"
            id="clientName"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="clientRif" className="block text-sm font-medium text-gray-700">RIF</label>
          <input
            type="text"
            id="clientRif"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={clientRif}
            onChange={(e) => setClientRif(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700">Teléfono</label>
          <input
            type="tel"
            id="clientPhone"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="clientAddress" className="block text-sm font-medium text-gray-700">Dirección</label>
          <textarea
            id="clientAddress"
            rows="3"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Método de Pago</label>
            <select
              id="paymentMethod"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="contado">Contado</option>
              <option value="credito">Crédito</option>
            </select>
          </div>
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Moneda</label>
            <select
              id="currency"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {currencies.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.symbol})</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="seller" className="block text-sm font-medium text-gray-700">Vendedor</label>
            <select
              id="seller"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={sellerId}
              onChange={(e) => setSellerId(e.target.value)}
              required
            >
              <option value="">-- Seleccionar Vendedor --</option>
              {sellers.map(seller => (
                <option key={seller.id} value={seller.id}>{seller.name}</option>
              ))}
            </select>
          </div>
        </div>

        <ItemSelector onAddItem={handleAddItem} />

        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">Añadir Servicio o Artículo Manual</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div className="sm:col-span-1">
              <label htmlFor="manualDescription" className="block text-sm font-medium text-gray-700">Descripción</label>
              <input
                type="text"
                id="manualDescription"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                placeholder="Ej: Mano de obra, Diagnóstico"
              />
            </div>
            <div>
              <label htmlFor="manualQuantity" className="block text-sm font-medium text-gray-700">Cantidad</label>
              <input
                type="number"
                id="manualQuantity"
                min="1"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={manualQuantity}
                onChange={(e) => setManualQuantity(parseInt(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="manualPrice" className="block text-sm font-medium text-gray-700">Precio ({selectedCurrencySymbol})</label>
              <input
                type="number"
                id="manualPrice"
                step="0.01"
                min="0"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={manualPrice}
                onChange={(e) => setManualPrice(e.target.value)}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddManualItem}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Añadir Manualmente
          </button>
        </div>

        {quoteItems.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Artículos/Servicios en Cotización</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                    <th className="py-2 px-4 border-b">Descripción</th>
                    <th className="py-2 px-4 border-b">Almacén/Tipo</th>
                    <th className="py-2 px-4 border-b">Cantidad</th>
                    <th className="py-2 px-4 border-b">Precio Unitario ({selectedCurrencySymbol})</th>
                    <th className="py-2 px-4 border-b">Total ({selectedCurrencySymbol})</th>
                    <th className="py-2 px-4 border-b">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteItems.map(item => (
                    <tr key={`${item.id}-${item.warehouseId}`} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b text-sm">{item.name} {item.partNumber !== 'N/A' ? `(${item.partNumber})` : ''}</td>
                      <td className="py-2 px-4 border-b text-sm">{item.isService ? 'Servicio' : (warehouses.find(w => w.id === item.warehouseId)?.name || 'N/A')}</td>
                      <td className="py-2 px-4 border-b text-sm">{item.quantity}</td>
                      <td className="py-2 px-4 border-b text-sm">{selectedCurrencySymbol}{item.price.toFixed(2)}</td>
                      <td className="py-2 px-4 border-b text-sm">{selectedCurrencySymbol}{(item.quantity * item.price).toFixed(2)}</td>
                      <td className="py-2 px-4 border-b text-sm">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id, item.warehouseId)}
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
            <div className="text-right text-xl font-bold mt-4">
              Total de Cotización: {selectedCurrencySymbol}{totalQuote.toFixed(2)}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
          <button type="button" onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {initialQuote ? 'Guardar Cambios' : 'Crear Cotización'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuoteForm;


// DONE