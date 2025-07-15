import React, { useState, useEffect } from 'react';

const QuoteDocument = ({ quote, onBackToList, onSaveQuote }) => {
  const [editableQuote, setEditableQuote] = useState({ ...quote });

  useEffect(() => {
    setEditableQuote({ ...quote });
  }, [quote]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...editableQuote.items];
    updatedItems[index][field] = ['quantity', 'price'].includes(field)
      ? parseFloat(value) || 0
      : value;
    setEditableQuote({ ...editableQuote, items: updatedItems });
  };

  const handleAddItem = () => {
    setEditableQuote({
      ...editableQuote,
      items: [...editableQuote.items, { name: '', quantity: 1, price: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = editableQuote.items.filter((_, i) => i !== index);
    setEditableQuote({ ...editableQuote, items: updatedItems });
  };

  const calculateTotal = () => {
    return editableQuote.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableQuote({ ...editableQuote, [name]: value });
  };

  const handleSave = () => {
    const updatedQuote = { ...editableQuote, total: calculateTotal() };
    const method = updatedQuote.id ? 'PUT' : 'POST';
    const url = updatedQuote.id
      ? `http://localhost:3001/api/quotes/${updatedQuote.id}`
      : `http://localhost:3001/api/quotes`;

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedQuote)
    })
      .then((res) => res.json())
      .then((data) => {
        alert('Cotización guardada');
        onSaveQuote?.(data.id || updatedQuote.id);
        onBackToList();
      });
  };

  const handleApprove = () => {
    fetch(`http://localhost:3001/api/quotes/${editableQuote.id}/approve`, {
      method: 'POST',
    })
      .then((res) => res.json())
      .then(() => {
        alert('Cotización aprobada');
        onBackToList();
      });
  };

  const handleReturn = () => {
    fetch(`http://localhost:3001/api/quotes/${editableQuote.id}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: editableQuote.items }),
    })
      .then((res) => res.json())
      .then(() => {
        alert('Cotización devuelta y stock actualizado');
        onBackToList();
      });
  };

  const handleDelete = () => {
    if (!window.confirm('¿Eliminar esta cotización?')) return;
    fetch(`http://localhost:3001/api/quotes/${editableQuote.id}`, {
      method: 'DELETE'
    })
      .then((res) => res.json())
      .then(() => {
        alert('Cotización eliminada');
        onBackToList();
      });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-dark mb-6">
        Cotización #{editableQuote.id || 'Nueva'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          name="client"
          value={editableQuote.client}
          onChange={handleChange}
          placeholder="Cliente"
          className="input-style"
        />
        <input
          type="date"
          name="date"
          value={editableQuote.date}
          onChange={handleChange}
          className="input-style"
        />
        <input
          type="text"
          name="address"
          value={editableQuote.address}
          onChange={handleChange}
          placeholder="Dirección"
          className="input-style"
        />
        <input
          type="text"
          name="phone"
          value={editableQuote.phone}
          onChange={handleChange}
          placeholder="Teléfono"
          className="input-style"
        />
      </div>

      <h3 className="text-lg font-semibold mb-3 text-dark">Productos</h3>
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-muted text-dark text-left">
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Cantidad</th>
              <th className="p-2 border">Precio</th>
              <th className="p-2 border">Subtotal</th>
              <th className="p-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {editableQuote.items.map((item, idx) => (
              <tr key={idx}>
                <td className="border p-2">
                  <input
                    value={item.name}
                    onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                    className="input-style"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    className="input-style"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                    className="input-style"
                  />
                </td>
                <td className="border p-2 text-right">
                  {(item.price * item.quantity).toFixed(2)}
                </td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => handleRemoveItem(idx)}
                    className="text-red-500 hover:underline text-sm"
                  >
                    Quitar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleAddItem}
        className="btn-gray my-4 transition hover:scale-105"
      >
        ➕ Agregar producto
      </button>

      <p className="text-right text-xl font-bold text-dark mb-6">
        Total: ${calculateTotal().toFixed(2)}
      </p>

      <div className="flex flex-wrap gap-3 justify-end">
        <button onClick={onBackToList} className="btn-gray">Volver</button>
        <button onClick={handleSave} className="btn-blue">Guardar</button>
        {editableQuote.id && (
          <>
            <button onClick={handleApprove} className="btn-green">Aprobar</button>
            <button onClick={handleReturn} className="btn-yellow">Devolver</button>
            <button onClick={handleDelete} className="btn-red">Eliminar</button>
          </>
        )}
      </div>
    </div>
  );
};

export default QuoteDocument;
