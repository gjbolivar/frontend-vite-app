import React from 'react';

const InventoryNavBar = ({ selectedTab, setSelectedTab }) => {
  const tabs = [
    { label: '📦 Inventario', value: 'inventory' },
    { label: '🧾 Cotizaciones', value: 'quotes' },
    { label: '🚚 Entregas', value: 'deliveries' },
    { label: '💼 Proveedores', value: 'suppliers' },
    { label: '📊 Reportes', value: 'reports' },
  ];

  return (
    <nav className="bg-primary text-white shadow-md px-4 sm:px-8 py-3 flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-6">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => setSelectedTab(tab.value)}
          className={`transition px-4 py-2 rounded-md font-semibold text-sm sm:text-base
            ${selectedTab === tab.value
              ? 'bg-white text-primary shadow'
              : 'hover:bg-white/20 hover:text-white'}`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default InventoryNavBar;

