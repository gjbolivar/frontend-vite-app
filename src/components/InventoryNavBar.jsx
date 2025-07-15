import React, { useState } from 'react';

const InventoryNavBar = ({ activeTab, setActiveTab, currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);

  const allTabs = [
    { id: 'inventory', name: 'Repuestos' },
    { id: 'quotes', name: 'Cotizaciones' },
    { id: 'deliveries', name: 'Cotizaciones Aprobadas' },
    { id: 'reports', name: 'Reportes' },
    { id: 'clients', name: 'Clientes' },
    { id: 'sellers', name: 'Vendedores' },
    { id: 'users', name: 'Usuarios' }
  ];

  let accessibleTabs = [];
  if (currentUser) {
    if (currentUser.role === 'admin') {
      accessibleTabs = allTabs;
    } else if (currentUser.permissions) {
      accessibleTabs = allTabs.filter(tab => currentUser.permissions.includes(tab.id));
    }
  }

  return (
    <nav className="bg-white shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Sistema de Inventario</h1>
          </div>
          <div className="hidden sm:flex">
            {accessibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ease-in-out ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menú principal</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {accessibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ease-in-out ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default InventoryNavBar;
