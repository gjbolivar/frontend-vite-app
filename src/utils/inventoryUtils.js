import { getStorage, setStorage } from './storage';

export const updateStock = (items, type = 'subtract') => {
  const currentParts = getStorage('truckParts');
  let updatedParts = [...currentParts];

  items.forEach(item => {
    if (!item.isService) { // Solo actualizar stock si no es un servicio
      const partIndex = updatedParts.findIndex(p => p.id === item.id && p.warehouseId === item.warehouseId);
      if (partIndex !== -1) {
        if (type === 'subtract') {
          updatedParts[partIndex].stock -= item.quantity;
        } else if (type === 'add') {
          updatedParts[partIndex].stock += item.quantity;
        }
      }
    }
  });
  setStorage('truckParts', updatedParts);
};

export const getPartDetails = (partId) => {
  const parts = getStorage('truckParts');
  return parts.find(part => part.id === partId);
};


// DONE