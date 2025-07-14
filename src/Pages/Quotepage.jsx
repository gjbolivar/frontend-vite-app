import React, { useState } from 'react';
import QuoteList from './QuoteList';
import QuoteDocument from './QuoteDocument';

const QuotesPage = () => {
  const [selectedQuote, setSelectedQuote] = useState(null);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {selectedQuote ? (
        <QuoteDocument
          quote={selectedQuote}
          onBackToList={() => setSelectedQuote(null)}
        />
      ) : (
        <QuoteList
          onCreateNew={() =>
            setSelectedQuote({
              client: '',
              rif: '',
              phone: '',
              address: '',
              date: new Date().toISOString().split('T')[0],
              items: [],
              paymentMethod: 'contado',
              sellerId: '',
              currency: 'usd',
              status: 'pendiente',
              total: 0,
            })
          }
          onViewQuote={(quote) => setSelectedQuote(quote)}
        />
      )}
    </div>
  );
};

export default QuotesPage;
