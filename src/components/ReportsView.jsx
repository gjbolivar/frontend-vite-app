import React, { useState, useEffect } from 'react';
import ReportFilter from './ReportFilter';
import { getStorage } from '../utils/storage';
import { warehouses } from '../mock/warehouses';
import { getPartDetails } from '../utils/inventoryUtils';
import { currencies } from '../mock/currencies';
import { sellers } from '../mock/sellers';
import { exportToExcel } from '../utils/helpers';

const ReportsView = () => {
  const [quotes, setQuotes] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [selectedReportType, setSelectedReportType] = useState(''); // 'deliveries', 'salesByWarehouse', 'detailedSales', 'salesBySeller', 'approvedQuotes', 'returns'
  const [reportFilters, setReportFilters] = useState({ clientName: '', startDate: '', endDate: '' });
  const [selectedWarehouseForSales, setSelectedWarehouseForSales] = useState('all');
  const [salesReportStartDate, setSalesReportStartDate] = useState('');
  const [salesReportEndDate, setSalesReportEndDate] = useState('');

  useEffect(() => {
    const allQuotes = getStorage('quotes');
    const allDeliveries = getStorage('deliveries');
    setQuotes(allQuotes);
    setDeliveries(allDeliveries);
    applyFilters(reportFilters);
  }, []);

  useEffect(() => {
    applyFilters(reportFilters);
  }, [quotes, deliveries, reportFilters]);

  const applyFilters = (filters) => {
    setReportFilters(filters);
    const { clientName, startDate, endDate } = filters;

    const filteredQ = quotes.filter(quote => {
      const matchesClient = clientName ? quote.client.toLowerCase().includes(clientName.toLowerCase()) : true;
      const matchesStartDate = startDate ? new Date(quote.date) >= new Date(startDate) : true;
      const matchesEndDate = endDate ? new Date(quote.date) <= new Date(endDate) : true;
      return matchesClient && matchesStartDate && matchesEndDate;
    });
    setFilteredQuotes(filteredQ);

    const filteredD = deliveries.filter(delivery => {
      const matchesClient = clientName ? delivery.client.toLowerCase().includes(clientName.toLowerCase()) : true;
      const matchesStartDate = startDate ? new Date(delivery.date) >= new Date(startDate) : true;
      const matchesEndDate = endDate ? new Date(delivery.date) <= new Date(endDate) : true;
      return matchesClient && matchesStartDate && matchesEndDate;
    });
    setFilteredDeliveries(filteredD);
  };

  const getSalesDetailsByWarehouse = () => {
    let totalSales = 0;
    const itemsSold = [];

    filteredDeliveries.forEach(delivery => {
      const deliveryCurrencySymbol = currencies.find(c => c.id === delivery.currency)?.symbol || '$';
      delivery.items.forEach(item => {
        if (!item.isService && (selectedWarehouseForSales === 'all' || item.warehouseId === selectedWarehouseForSales)) {
          const partDetails = getPartDetails(item.id);
          itemsSold.push({
            id: item.id,
            deliveryId: delivery.id,
            deliveryDate: delivery.date,
            partNumber: partDetails ? partDetails.partNumber : 'N/A',
            name: item.name,
            warehouseName: warehouses.find(w => w.id === item.warehouseId)?.name || 'N/A',
            quantity: item.quantity,
            price: item.price,
            cost: partDetails ? partDetails.cost : 0,
            totalItem: item.quantity * item.price,
            currencySymbol: deliveryCurrencySymbol
          });
          totalSales += item.quantity * item.price;
        }
      });
    });
    return { itemsSold, totalSales };
  };

  const { itemsSold, totalSales } = getSalesDetailsByWarehouse();

  const getDetailedSalesReport = () => {
    let totalSalesAmount = 0;
    let totalCostAmount = 0;
    const salesReportDeliveries = deliveries.filter(delivery => {
      const deliveryDate = new Date(delivery.date);
      const start = salesReportStartDate ? new Date(salesReportStartDate) : null;
      const end = salesReportEndDate ? new Date(salesReportEndDate) : null;
      return (!start || deliveryDate >= start) && (!end || deliveryDate <= end);
    });

    const reportDetails = salesReportDeliveries.map(delivery => {
      let deliveryTotal = 0;
      let deliveryCost = 0;
      const deliveryCurrencySymbol = currencies.find(c => c.id === delivery.currency)?.symbol || '$';

      const itemsDetails = delivery.items.map(item => {
        const partDetails = item.isService ? null : getPartDetails(item.id);
        const itemTotal = item.quantity * item.price;
        const itemCost = item.isService ? 0 : (item.quantity * (partDetails ? partDetails.cost : 0));
        
        deliveryTotal += itemTotal;
        deliveryCost += itemCost;

        return {
          partNumber: item.isService ? 'N/A' : (partDetails ? partDetails.partNumber : 'N/A'),
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: itemTotal,
          cost: itemCost,
          profit: itemTotal - itemCost,
          currencySymbol: deliveryCurrencySymbol,
          isService: item.isService || false
        };
      });
      totalSalesAmount += deliveryTotal;
      totalCostAmount += deliveryCost;

      return {
        id: delivery.id,
        client: delivery.client,
        date: delivery.date,
        items: itemsDetails,
        deliveryTotal,
        deliveryCost,
        deliveryProfit: deliveryTotal - deliveryCost,
        currencySymbol: deliveryCurrencySymbol
      };
    });

    return { reportDetails, totalSalesAmount, totalCostAmount, totalProfit: totalSalesAmount - totalCostAmount };
  };

  const { reportDetails, totalSalesAmount, totalCostAmount, totalProfit } = getDetailedSalesReport();

  const getSalesBySellerReport = () => {
    const salesBySeller = {};
    const allSellers = getStorage('sellers');

    allSellers.forEach(seller => {
      salesBySeller[seller.id] = {
        name: seller.name,
        totalSales: 0,
        totalCost: 0,
        totalProfit: 0,
        quotesCount: 0
      };
    });

    quotes.forEach(quote => {
      if (quote.status === 'aprobada' && quote.sellerId) {
        const sellerInfo = salesBySeller[quote.sellerId];
        if (sellerInfo) {
          const quoteTotal = quote.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
          let quoteCost = 0;
          quote.items.forEach(item => {
            if (!item.isService) {
              const partDetails = getPartDetails(item.id);
              quoteCost += item.quantity * (partDetails ? partDetails.cost : 0);
            }
          });

          sellerInfo.totalSales += quoteTotal;
          sellerInfo.totalCost += quoteCost;
          sellerInfo.totalProfit += (quoteTotal - quoteCost);
          sellerInfo.quotesCount += 1;
        }
      }
    });

    return Object.values(salesBySeller);
  };

  const salesBySellerReport = getSalesBySellerReport();

  const getApprovedQuotesReport = () => {
    return quotes.filter(quote => quote.status === 'aprobada');
  };

  const approvedQuotesReport = getApprovedQuotesReport();

  const getReturnsReport = () => {
    return deliveries.filter(delivery => delivery.status === 'devuelta');
  };

  const returnsReport = getReturnsReport();

  const handleExportApprovedQuotes = () => {
    const dataToExport = approvedQuotesReport.map(q => ({
      'ID Cotización': q.id,
      'Cliente': q.client,
      'RIF': q.rif,
      'Teléfono': q.phone,
      'Dirección': q.address,
      'Fecha': q.date,
      'Método de Pago': q.paymentMethod,
      'Vendedor': sellers.find(s => s.id === parseInt(q.sellerId))?.name || 'N/A',
      'Moneda': currencies.find(c => c.id === q.currency)?.symbol || '$',
      'Total': q.items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2),
      'Artículos': q.items.map(item => `${item.name} (${item.quantity} unid. de ${item.isService ? 'Servicio' : (warehouses.find(w => w.id === item.warehouseId)?.name || 'N/A')})`).join('; ')
    }));
    exportToExcel(dataToExport, 'Reporte_Cotizaciones_Aprobadas');
  };

  const handleExportDeliveries = () => {
    const dataToExport = filteredDeliveries.map(d => ({
      'ID Salida de Inventario': d.id,
      'Cliente': d.client,
      'RIF': d.rif,
      'Teléfono': d.phone,
      'Dirección': d.address,
      'Fecha': d.date,
      'Moneda': currencies.find(c => c.id === d.currency)?.symbol || '$',
      'Total': d.items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2),
      'Artículos': d.items.map(item => `${item.name} (${item.quantity} unid. de ${item.isService ? 'Servicio' : (warehouses.find(w => w.id === item.warehouseId)?.name || 'N/A')})`).join('; ')
    }));
    exportToExcel(dataToExport, 'Reporte_Salidas_Inventario');
  };

  const handleExportSalesDetail = () => {
    const dataToExport = itemsSold.map(item => ({
      'N° Salida de Inventario': item.deliveryId,
      'Fecha Entrega': item.deliveryDate,
      'Código': item.partNumber,
      'Descripción': item.name,
      'Almacén': item.warehouseName,
      'Cantidad': item.quantity,
      'Precio Unitario': item.price,
      'Costo Unitario': item.cost,
      'Total Artículo': item.totalItem,
      'Moneda': item.currencySymbol
    }));
    exportToExcel(dataToExport, 'Reporte_Ventas_Detalle_Por_Almacen');
  };

  const handleExportDetailedSalesReport = () => {
    const dataToExport = [];
    reportDetails.forEach(delivery => {
      delivery.items.forEach(item => {
        dataToExport.push({
          'N° Salida de Inventario': delivery.id,
          'Cliente': delivery.client,
          'Fecha Entrega': delivery.date,
          'Código Artículo': item.partNumber,
          'Descripción Artículo': item.name,
          'Cantidad': item.quantity,
          'Precio Venta Unitario': item.price,
          'Costo Unitario': item.cost / item.quantity,
          'Total Venta Artículo': item.total,
          'Costo Total Artículo': item.cost,
          'Ganancia Artículo': item.profit,
          'Moneda': item.currencySymbol,
          'Tipo': item.isService ? 'Servicio' : 'Producto'
        });
      });
    });
    dataToExport.push({});
    dataToExport.push({
      '': 'Totales del Reporte',
      'Total Ventas': totalSalesAmount,
      'Total Costo': totalCostAmount,
      'Ganancia Total': totalProfit,
      'Moneda': '$'
    });
    exportToExcel(dataToExport, 'Reporte_Ventas_Detallado');
  };

  const handleExportSalesBySeller = () => {
    const dataToExport = salesBySellerReport.map(seller => ({
      'Vendedor': seller.name,
      'Total Ventas': seller.totalSales.toFixed(2),
      'Total Costo': seller.totalCost.toFixed(2),
      'Ganancia Total': seller.totalProfit.toFixed(2),
      'Número de Cotizaciones Aprobadas': seller.quotesCount
    }));
    exportToExcel(dataToExport, 'Reporte_Ventas_Por_Vendedor');
  };

  const handleExportReturns = () => {
    const dataToExport = returnsReport.map(d => ({
      'ID Cotización Aprobada': d.id,
      'Cliente': d.client,
      'RIF': d.rif,
      'Teléfono': d.phone,
      'Dirección': d.address,
      'Fecha Devolución': d.date, // Usar la fecha de la nota de entrega como fecha de devolución
      'Moneda': currencies.find(c => c.id === d.currency)?.symbol || '$',
      'Total Original': d.items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2),
      'Artículos Devueltos': d.items.map(item => `${item.name} (${item.quantity} unid. de ${item.isService ? 'Servicio' : (warehouses.find(w => w.id === item.warehouseId)?.name || 'N/A')})`).join('; ')
    }));
    exportToExcel(dataToExport, 'Reporte_Devoluciones');
  };

  const renderReportContent = () => {
    switch (selectedReportType) {
      case 'approvedQuotes':
        return (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg sm:text-xl font-semibold">Cotizaciones Aprobadas</h3>
              <button
                onClick={handleExportApprovedQuotes}
                className="bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-3 rounded-md flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 01-1-1V6a1 1 0 011-1h14a1 1 0 011 1v10a1 1 0 01-1 1H3zm1-9h12v7H4V8zm5 4a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Exportar
              </button>
            </div>
            {approvedQuotesReport.length === 0 ? (
              <p className="text-gray-500">No hay cotizaciones aprobadas que coincidan con los filtros.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                      <th className="py-2 px-4 border-b">ID</th>
                      <th className="py-2 px-4 border-b">Cliente</th>
                      <th className="py-2 px-4 border-b">Fecha</th>
                      <th className="py-2 px-4 border-b">Vendedor</th>
                      <th className="py-2 px-4 border-b">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedQuotesReport.map((quote) => (
                      <tr key={quote.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b text-sm">{quote.id}</td>
                        <td className="py-2 px-4 border-b text-sm">{quote.client}</td>
                        <td className="py-2 px-4 border-b text-sm">{quote.date}</td>
                        <td className="py-2 px-4 border-b text-sm">{sellers.find(s => s.id === parseInt(quote.sellerId))?.name || 'N/A'}</td>
                        <td className="py-2 px-4 border-b text-sm">
                          {currencies.find(c => c.id === quote.currency)?.symbol || '$'}
                          {quote.items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'deliveries':
        return (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg sm:text-xl font-semibold">Salidas de Inventario Filtradas</h3>
              <button
                onClick={handleExportDeliveries}
                className="bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-3 rounded-md flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 01-1-1V6a1 1 0 011-1h14a1 1 0 011 1v10a1 1 0 01-1 1H3zm1-9h12v7H4V8zm5 4a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Exportar
              </button>
            </div>
            {filteredDeliveries.length === 0 ? (
              <p className="text-gray-500">No hay salidas de inventario que coincidan con los filtros.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                      <th className="py-2 px-4 border-b">ID</th>
                      <th className="py-2 px-4 border-b">Cliente</th>
                      <th className="py-2 px-4 border-b">Fecha</th>
                      <th className="py-2 px-4 border-b">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeliveries.map((delivery) => (
                      <tr key={delivery.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b text-sm">{delivery.id}</td>
                        <td className="py-2 px-4 border-b text-sm">{delivery.client}</td>
                        <td className="py-2 px-4 border-b text-sm">{delivery.date}</td>
                        <td className="py-2 px-4 border-b text-sm">
                          {currencies.find(c => c.id === delivery.currency)?.symbol || '$'}
                          {delivery.items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'salesByWarehouse':
        return (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg sm:text-xl font-semibold">Detalle de Ventas por Almacén</h3>
              <button
                onClick={handleExportSalesDetail}
                className="bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-3 rounded-md flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 01-1-1V6a1 1 0 011-1h14a1 1 0 011 1v10a1 1 0 01-1 1H3zm1-9h12v7H4V8zm5 4a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Exportar
              </button>
            </div>
            <div className="mb-4">
              <label htmlFor="warehouseFilter" className="block text-sm font-medium text-gray-700">Seleccionar Almacén</label>
              <select
                id="warehouseFilter"
                className="mt-1 block w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedWarehouseForSales}
                onChange={(e) => setSelectedWarehouseForSales(e.target.value)}
              >
                <option value="all">Todos los Almacenes</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                ))}
              </select>
            </div>

            {itemsSold.length === 0 ? (
              <p className="text-gray-500">No hay artículos vendidos para el almacén seleccionado o los filtros aplicados.</p>
            ) : (
              <>
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                        <th className="py-2 px-4 border-b">N° Salida de Inventario</th>
                        <th className="py-2 px-4 border-b">Fecha Entrega</th>
                        <th className="py-2 px-4 border-b">Código</th>
                        <th className="py-2 px-4 border-b">Descripción</th>
                        <th className="py-2 px-4 border-b">Almacén</th>
                        <th className="py-2 px-4 border-b">Cantidad</th>
                        <th className="py-2 px-4 border-b">Precio Unitario</th>
                        <th className="py-2 px-4 border-b">Costo Unitario</th>
                        <th className="py-2 px-4 border-b">Total Artículo</th>
                        <th className="py-2 px-4 border-b">Moneda</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemsSold.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b text-sm">{item.deliveryId}</td>
                          <td className="py-2 px-4 border-b text-sm">{item.deliveryDate}</td>
                          <td className="py-2 px-4 border-b text-sm">{item.partNumber}</td>
                          <td className="py-2 px-4 border-b text-sm">{item.name}</td>
                          <td className="py-2 px-4 border-b text-sm">{item.warehouseName}</td>
                          <td className="py-2 px-4 border-b text-sm">{item.quantity}</td>
                          <td className="py-2 px-4 border-b text-sm">{item.currencySymbol}{item.price.toFixed(2)}</td>
                          <td className="py-2 px-4 border-b text-sm">{item.currencySymbol}{item.cost.toFixed(2)}</td>
                          <td className="py-2 px-4 border-b text-sm">{item.currencySymbol}{(item.quantity * item.price).toFixed(2)}</td>
                          <td className="py-2 px-4 border-b text-sm">{item.currencySymbol}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-right text-lg sm:text-xl font-bold mt-4">
                  Total de Ventas del Almacén {selectedWarehouseForSales === 'all' ? 'General' : warehouses.find(w => w.id === selectedWarehouseForSales)?.name}: ${totalSales.toFixed(2)}
                </div>
              </>
            )}
          </div>
        );
      case 'detailedSales':
        return (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg sm:text-xl font-semibold">Reporte de Ventas Detallado</h3>
              <button
                onClick={handleExportDetailedSalesReport}
                className="bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-3 rounded-md flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 01-1-1V6a1 1 0 011-1h14a1 1 0 011 1v10a1 1 0 01-1 1H3zm1-9h12v7H4V8zm5 4a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Exportar
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="salesReportStartDate" className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
                <input
                  type="date"
                  id="salesReportStartDate"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={salesReportStartDate}
                  onChange={(e) => setSalesReportStartDate(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="salesReportEndDate" className="block text-sm font-medium text-gray-700">Fecha Fin</label>
                <input
                  type="date"
                  id="salesReportEndDate"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={salesReportEndDate}
                  onChange={(e) => setSalesReportEndDate(e.target.value)}
                />
              </div>
            </div>

            {reportDetails.length === 0 ? (
              <p className="text-gray-500">No hay ventas en el rango de fechas seleccionado.</p>
            ) : (
              <>
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                        <th className="py-2 px-4 border-b">N° Salida de Inventario</th>
                        <th className="py-2 px-4 border-b">Cliente</th>
                        <th className="py-2 px-4 border-b">Fecha</th>
                        <th className="py-2 px-4 border-b">Total Venta</th>
                        <th className="py-2 px-4 border-b">Costo Total</th>
                        <th className="py-2 px-4 border-b">Ganancia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportDetails.map((delivery) => (
                        <React.Fragment key={delivery.id}>
                          <tr className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b text-sm">{delivery.id}</td>
                            <td className="py-2 px-4 border-b text-sm">{delivery.client}</td>
                            <td className="py-2 px-4 border-b text-sm">{delivery.date}</td>
                            <td className="py-2 px-4 border-b text-sm">{delivery.currencySymbol}{delivery.deliveryTotal.toFixed(2)}</td>
                            <td className="py-2 px-4 border-b text-sm">{delivery.currencySymbol}{delivery.deliveryCost.toFixed(2)}</td>
                            <td className="py-2 px-4 border-b text-sm">{delivery.currencySymbol}{delivery.deliveryProfit.toFixed(2)}</td>
                          </tr>
                          {/* Detalles de artículos por entrega */}
                          {delivery.items.map((item, itemIndex) => (
                            <tr key={`${delivery.id}-${itemIndex}-item`} className="bg-gray-50 text-xs">
                              <td className="py-1 px-4 border-b pl-8"></td>
                              <td className="py-1 px-4 border-b" colSpan="2">{item.name} ({item.partNumber}) {item.isService && '(Servicio)'}</td>
                              <td className="py-1 px-4 border-b">Cant: {item.quantity}</td>
                              <td className="py-1 px-4 border-b">P.U.: {item.currencySymbol}{item.price.toFixed(2)}</td>
                              <td className="py-1 px-4 border-b">Total: {item.currencySymbol}{item.total.toFixed(2)}</td>
                              <td className="py-1 px-4 border-b">Costo: {item.currencySymbol}{item.cost.toFixed(2)}</td>
                              <td className="py-1 px-4 border-b">Ganancia: {item.currencySymbol}{item.profit.toFixed(2)}</td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-right text-lg sm:text-xl font-bold mt-4">
                  <p>Total Ventas: ${totalSalesAmount.toFixed(2)}</p>
                  <p>Total Costo: ${totalCostAmount.toFixed(2)}</p>
                  <p className="text-green-700">Ganancia Total: ${totalProfit.toFixed(2)}</p>
                </div>
              </>
            )}
          </div>
        );
      case 'salesBySeller':
        return (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg sm:text-xl font-semibold">Reporte de Ventas por Vendedor</h3>
              <button
                onClick={handleExportSalesBySeller}
                className="bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-3 rounded-md flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 01-1-1V6a1 1 0 011-1h14a1 1 0 011 1v10a1 1 0 01-1 1H3zm1-9h12v7H4V8zm5 4a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Exportar
              </button>
            </div>
            {salesBySellerReport.length === 0 ? (
              <p className="text-gray-500">No hay datos de ventas por vendedor.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                      <th className="py-2 px-4 border-b">Vendedor</th>
                      <th className="py-2 px-4 border-b">Total Ventas</th>
                      <th className="py-2 px-4 border-b">Total Costo</th>
                      <th className="py-2 px-4 border-b">Ganancia Total</th>
                      <th className="py-2 px-4 border-b">Cotizaciones Aprobadas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesBySellerReport.map((seller, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b text-sm">{seller.name}</td>
                        <td className="py-2 px-4 border-b text-sm">${seller.totalSales.toFixed(2)}</td>
                        <td className="py-2 px-4 border-b text-sm">${seller.totalCost.toFixed(2)}</td>
                        <td className="py-2 px-4 border-b text-sm">${seller.totalProfit.toFixed(2)}</td>
                        <td className="py-2 px-4 border-b text-sm">{seller.quotesCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'returns':
        return (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg sm:text-xl font-semibold">Reporte de Devoluciones</h3>
              <button
                onClick={handleExportReturns}
                className="bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-3 rounded-md flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 01-1-1V6a1 1 0 011-1h14a1 1 0 011 1v10a1 1 0 01-1 1H3zm1-9h12v7H4V8zm5 4a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Exportar
              </button>
            </div>
            {returnsReport.length === 0 ? (
              <p className="text-gray-500">No hay devoluciones registradas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                      <th className="py-2 px-4 border-b">ID Cotización Aprobada</th>
                      <th className="py-2 px-4 border-b">Cliente</th>
                      <th className="py-2 px-4 border-b">Fecha Devolución</th>
                      <th className="py-2 px-4 border-b">Total Original</th>
                      <th className="py-2 px-4 border-b">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnsReport.map((delivery) => (
                      <tr key={delivery.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b text-sm">{delivery.id}</td>
                        <td className="py-2 px-4 border-b text-sm">{delivery.client}</td>
                        <td className="py-2 px-4 border-b text-sm">{delivery.date}</td>
                        <td className="py-2 px-4 border-b text-sm">
                          {currencies.find(c => c.id === delivery.currency)?.symbol || '$'}
                          {delivery.items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)}
                        </td>
                        <td className="py-2 px-4 border-b text-sm capitalize">{delivery.status || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      default:
        return <p className="text-gray-500">Selecciona un tipo de reporte para comenzar.</p>;
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Reportes</h2>
      
      <div className="mb-6">
        <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Tipo de Reporte</label>
        <select
          id="reportType"
          className="mt-1 block w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={selectedReportType}
          onChange={(e) => setSelectedReportType(e.target.value)}
        >
          <option value="">-- Selecciona --</option>
          <option value="approvedQuotes">Reporte de Cotizaciones Aprobadas</option>
          <option value="deliveries">Reporte de Salidas de Inventario</option>
          <option value="salesByWarehouse">Reporte de Ventas por Almacén</option>
          <option value="detailedSales">Reporte de Ventas Detallado (Ganancia)</option>
          <option value="salesBySeller">Reporte de Ventas por Vendedor</option>
          <option value="returns">Reporte de Devoluciones</option> {/* Nueva opción */}
        </select>
      </div>

      {(selectedReportType === 'approvedQuotes' || selectedReportType === 'deliveries' || selectedReportType === 'returns') && ( // Añadido returns
        <ReportFilter onFilter={applyFilters} />
      )}

      {renderReportContent()}
    </div>
  );
};

export default ReportsView;


// DONE