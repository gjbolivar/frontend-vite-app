export const truckParts = [
  {
    id: 1,
    partNumber: "ABC-123",
    name: "Filtro de Aceite", // Cambiado a 'name' para que sea la descripción
    compatibleModels: ["Volvo FH", "Scania R"],
    brand: "Mann-Filter",
    price: 25.50,
    cost: 15.00, // Agregado el costo
    stock: 100,
    minStock: 20,
    location: "A1",
    model: "W950/1",
    warehouseId: 1
  },
  {
    id: 2,
    partNumber: "XYZ-456",
    name: "Pastillas de Freno", // Cambiado a 'name' para que sea la descripción
    compatibleModels: ["Mercedes-Benz Actros", "DAF XF"],
    brand: "Textar",
    price: 120.00,
    cost: 70.00, // Agregado el costo
    stock: 50,
    minStock: 10,
    location: "B2",
    model: "TMD234",
    warehouseId: 1
  },
  {
    id: 3,
    partNumber: "DEF-789",
    name: "Amortiguador Delantero", // Cambiado a 'name' para que sea la descripción
    compatibleModels: ["Volvo FH", "Renault T"],
    brand: "Sachs",
    price: 300.00,
    cost: 180.00, // Agregado el costo
    stock: 30,
    minStock: 5,
    location: "C3",
    model: "170 888",
    warehouseId: 2
  },
  {
    id: 4,
    partNumber: "GHI-012",
    name: "Batería 12V", // Cambiado a 'name' para que sea la descripción
    compatibleModels: ["Universal"],
    brand: "Varta",
    price: 150.00,
    cost: 90.00, // Agregado el costo
    stock: 80,
    minStock: 15,
    location: "D4",
    model: "Blue Dynamic",
    warehouseId: 2
  },
  {
    id: 5,
    partNumber: "JKL-345",
    name: "Correa de Distribución", // Cambiado a 'name' para que sea la descripción
    compatibleModels: ["Scania R", "DAF XF"],
    brand: "ContiTech",
    price: 80.00,
    cost: 45.00, // Agregado el costo
    stock: 60,
    minStock: 10,
    location: "E5",
    model: "CT1028",
    warehouseId: 1
  }
];