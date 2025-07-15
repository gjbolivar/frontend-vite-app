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
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">📑 Cotizaciones</h2>
        <button onClick={onCreateNew} className="btn-blue">
          ➕ Nueva Cotización
        </button>
      </div>

      {quotes.length === 0 ? (
        <p className="text-gray-500 text-center">No hay cotizaciones registradas.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-50 text-gray-700 font-semibold">
              <tr>
                <th className="px-4 py-3 text-left">N°</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quotes.map((quote) => (
                <tr key={quote.id} className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-2">{quote.id}</td>
                  <td className="px-4 py-2">{quote.client}</td>
                  <td className="px-4 py-2">{quote.date}</td>
                  <td className="px-4 py-2">
                    ${quote.total?.toFixed(2)} {quote.currency?.toUpperCase()}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        quote.status === 'aprobada'
                          ? 'bg-green-100 text-green-700'
                          : quote.status === 'devuelta'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => onViewQuote(quote)} className="btn-blue text-sm px-3 py-1">
                        Ver
                      </button>
                      {quote.status !== 'aprobada' && (
                        <button onClick={() => handleApprove(quote.id)} className="btn-green text-sm px-3 py-1">
                          Aprobar
                        </button>
                      )}
                      {quote.status === 'aprobada' && (
                        <button onClick={() => handleReturn(quote.id)} className="btn-yellow text-sm px-3 py-1">
                          Devolver
                        </button>
                      )}
                      <button onClick={() => handleDelete(quote.id)} className="btn-red text-sm px-3 py-1">
                        Eliminar
                      </button>
                    </div>
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
