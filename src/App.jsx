import React, { useState, useEffect } from 'react';
import InventoryNavBar from './components/InventoryNavBar.jsx';
import InventoryView from './components/InventoryView';
import QuoteList from './components/QuoteList';
import QuoteDocument from './components/QuoteDocument.jsx';
import DeliveryList from './components/DeliveryList';
import DeliveryDocument from './components/DeliveryDocument';
import ReportsView from './components/ReportsView';
import ClientsView from './components/ClientsView';
import SellersView from './components/SellersView';
import UsersView from './components/UsersView';
import LoginScreen from './components/LoginScreen';
import { createStorage, getStorage, setStorage } from './utils/storage';
import { sellers as initialSellers } from './mock/sellers';
import { users as initialUsers } from './mock/users';

const App = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [quoteView, setQuoteView] = useState('list');
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [deliveryView, setDeliveryView] = useState('list');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    createStorage('truckParts', []);
    createStorage('deliveries', []);
    createStorage('clients', []);
    createStorage('sellers', initialSellers);

    const storedUsers = getStorage('users');
    if (storedUsers.length === 0) {
      const usersWithPermissions = initialUsers.map(user => ({
        ...user,
        permissions: user.role === 'admin'
          ? ['inventory', 'quotes', 'deliveries', 'reports', 'clients', 'sellers', 'users']
          : ['inventory', 'quotes', 'deliveries', 'reports']
      }));
      setStorage('users', usersWithPermissions);
    }
  }, []);

  const renderQuoteSection = () => {
    if (quoteView === 'view' && selectedQuote) {
      return <QuoteDocument quote={selectedQuote} onBackToList={() => setQuoteView('list')} />;
    } else {
      return (
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
            }) || setQuoteView('view')
          }
          onViewQuote={(quote) => {
            fetch(`http://localhost:3001/api/quotes/${quote.id}`)
              .then(res => res.json())
              .then(data => {
                setSelectedQuote(data);
                setQuoteView('view');
              });
          }}
        />
      );
    }
  };

  const renderDeliverySection = () => {
    if (deliveryView === 'view' && selectedDelivery) {
      return <DeliveryDocument delivery={selectedDelivery} onBackToList={() => setDeliveryView('list')} />;
    } else {
      return <DeliveryList onViewDelivery={(delivery) => { setSelectedDelivery(delivery); setDeliveryView('view'); }} />;
    }
  };

  const renderContent = () => {
    if (!currentUser) {
      return <LoginScreen onLogin={setCurrentUser} />;
    }

    const hasPermission = (sectionId) => {
      if (currentUser.role === 'admin') return true;
      return currentUser.permissions && currentUser.permissions.includes(sectionId);
    };

    switch (activeTab) {
      case 'inventory':
        return hasPermission('inventory') ? <InventoryView /> : <p className="text-center text-red-500">Acceso denegado.</p>;
      case 'quotes':
        return hasPermission('quotes') ? renderQuoteSection() : <p className="text-center text-red-500">Acceso denegado.</p>;
      case 'deliveries':
        return hasPermission('deliveries') ? renderDeliverySection() : <p className="text-center text-red-500">Acceso denegado.</p>;
      case 'reports':
        return hasPermission('reports') ? <ReportsView /> : <p className="text-center text-red-500">Acceso denegado.</p>;
      case 'clients':
        return hasPermission('clients') ? <ClientsView /> : <p className="text-center text-red-500">Acceso denegado.</p>;
      case 'sellers':
        return hasPermission('sellers') ? <SellersView /> : <p className="text-center text-red-500">Acceso denegado.</p>;
      case 'users':
        return hasPermission('users') ? <UsersView /> : <p className="text-center text-red-500">Acceso denegado.</p>;
      default:
        return <p className="text-center text-red-500">Selecciona una opción del menú.</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {currentUser && <InventoryNavBar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />}
      <main className="flex-1 p-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
