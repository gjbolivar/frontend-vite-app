import React, { useEffect, useState } from 'react';

const QuoteList = ({ onCreateNew, onViewQuote }) => {
  const [quotes, setQuotes] = useState([]);

  const fetchQuotes = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/quotes');
      const data = await res.json();
      setQuotes(data);
    } catch (err) {
      console.error('Error al obtener cotizaciones:', err);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta cotización?')) {
      try {
        await fetch(`http://localhost:3001/api/quotes/${id}`, { method: 'DELETE' });
        fetchQuotes();
      } catch (err) {
        console.error('Error al eliminar cotización:', err);
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      await fetch(`http://localhost:3001/api/quotes/${id}/approve`, { method: 'POST' });
      fetchQuotes();
    } catch (err) {
      console.error('Error al aprobar cotización:', err);
    }
  };

  const handleReturn = async (id) => {
    if (window.confirm('¿Confirmar devolución de esta cotización?')) {
      try {
        await fetch(`http://localhost:3001/api/quotes/${id}/return`, { method: 'POST' });
        fetchQuotes();
      } catch (err) {
        console.error('Error al devolver cotización:', err);
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Listado de Cotizaciones</h2>
        <button
          onClick={onCreateNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Nueva Cotización
        </button>
      </div>
      {quotes.length === 0 ? (
        <p className="text-gray-500">No hay cotizaciones registradas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">N°</th>
                <th className="p-2 border">Cliente</th>
                <th className="p-2 border">Fecha</th>
                <th className="p-2 border">Total</th>
                <th className="p-2 border">Estado</th>
                <th className="p-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id} className="text-center border-t">
                  <td className="p-2 border">{quote.id}</td>
                  <td className="p-2 border">{quote.client}</td>
                  <td className="p-2 border">{quote.date}</td>
                  <td className="p-2 border">{quote.total?.toFixed(2)} {quote.currency?.toUpperCase()}</td>
                  <td className="p-2 border capitalize">{quote.status}</td>
                  <td className="p-2 border flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => onViewQuote(quote)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      Ver
                    </button>
                    {quote.status !== 'aprobada' && (
                      <button
                        onClick={() => handleApprove(quote.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                      >
                        Aprobar
                      </button>
                    )}
                    {quote.status === 'aprobada' && (
                      <button
                        onClick={() => handleReturn(quote.id)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                      >
                        Devolver
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(quote.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QuoteList;
