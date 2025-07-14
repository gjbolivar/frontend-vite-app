import React, { useState, useEffect } from 'react';
import { getStorage, setStorage } from '../utils/storage';
import { users as initialUsers } from '../mock/users';

// Definición de permisos por rol
const rolePermissions = {
  admin: ['inventory', 'quotes', 'deliveries', 'reports', 'clients', 'sellers', 'users'],
  user: ['inventory', 'quotes', 'deliveries', 'reports'],
  // Puedes añadir más roles y sus permisos aquí
};

const UsersView = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'add', 'edit'
  const [selectedUser, setSelectedUser] = useState(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Default role
  const [permissions, setPermissions] = useState([]); // Permisos del usuario

  // Todas las secciones disponibles para el checklist
  const allSections = [
    { id: 'inventory', name: 'Repuestos' },
    { id: 'quotes', name: 'Cotizaciones' },
    { id: 'deliveries', name: 'Salidas de Inventario' },
    { id: 'reports', name: 'Reportes' },
    { id: 'clients', name: 'Clientes' },
    { id: 'sellers', name: 'Vendedores' },
    { id: 'users', name: 'Administración de Usuarios' },
  ];

  useEffect(() => {
    // Inicializar usuarios si no existen en el almacenamiento
    if (getStorage('users').length === 0) {
      setStorage('users', initialUsers);
    }
    loadUsers();
  }, []);

  // Actualizar permisos cuando cambia el rol seleccionado
  useEffect(() => {
    setPermissions(rolePermissions[role] || []);
  }, [role]);

  const loadUsers = () => {
    setUsers(getStorage('users'));
    setViewMode('list');
    setSelectedUser(null);
    resetForm();
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setRole('user');
    setPermissions(rolePermissions['user'] || []); // Resetear a permisos de 'user'
  };

  const handlePermissionChange = (sectionId) => {
    setPermissions(prevPermissions => {
      if (prevPermissions.includes(sectionId)) {
        return prevPermissions.filter(id => id !== sectionId);
      } else {
        return [...prevPermissions, sectionId];
      }
    });
  };

  const handleAddEditUser = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      alert('Usuario y contraseña no pueden estar vacíos.');
      return;
    }

    const currentUsers = getStorage('users');
    const usernameExists = currentUsers.some(u => u.username === username && u.id !== (selectedUser ? selectedUser.id : null));
    if (usernameExists) {
      alert('El nombre de usuario ya existe.');
      return;
    }

    const newUser = {
      id: selectedUser ? selectedUser.id : Date.now(),
      username: username.trim(),
      password: password.trim(), // En un entorno real, la contraseña debería ser hasheada
      role: role,
      permissions: permissions, // Guardar los permisos seleccionados
    };

    let updatedUsers;
    if (selectedUser) {
      updatedUsers = currentUsers.map(user => user.id === newUser.id ? newUser : user);
    } else {
      updatedUsers = [...currentUsers, newUser];
    }
    setStorage('users', updatedUsers);
    loadUsers();
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      const currentUsers = getStorage('users');
      const updatedUsers = currentUsers.filter(user => user.id !== id);
      setStorage('users', updatedUsers);
      loadUsers();
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setUsername(user.username);
    setPassword(user.password); // En un entorno real, no se debería cargar la contraseña
    setRole(user.role);
    setPermissions(user.permissions || rolePermissions[user.role] || []); // Cargar permisos existentes o por defecto del rol
    setViewMode('edit');
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
      {viewMode === 'list' ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-0">Gestión de Usuarios</h2>
            <button
              onClick={() => setViewMode('add')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
            >
              Agregar Nuevo Usuario
            </button>
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar usuario por nombre..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                  <th className="py-2 px-4 border-b">Usuario</th>
                  <th className="py-2 px-4 border-b">Rol</th>
                  <th className="py-2 px-4 border-b">Permisos</th>
                  <th className="py-2 px-4 border-b">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-sm">{user.username}</td>
                    <td className="py-2 px-4 border-b text-sm capitalize">{user.role}</td>
                    <td className="py-2 px-4 border-b text-sm">
                      {user.permissions && user.permissions.length > 0
                        ? user.permissions.map(p => allSections.find(s => s.id === p)?.name || p).join(', ')
                        : 'Ninguno'}
                    </td>
                    <td className="py-2 px-4 border-b text-sm flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <p className="text-center text-gray-500 mt-4">No se encontraron usuarios.</p>
          )}
        </>
      ) : (
        <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">{selectedUser ? 'Modificar Usuario' : 'Agregar Nuevo Usuario'}</h2>
          <form onSubmit={handleAddEditUser} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Usuario</label>
              <input type="text" id="username" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input type="password" id="password" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rol</label>
              <select id="role" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="admin">Admin</option>
                <option value="user">Usuario</option>
              </select>
            </div>
            
            {/* Sección de Permisos */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-3">Permisos de Acceso</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allSections.map(section => (
                  <div key={section.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`perm-${section.id}`}
                      checked={permissions.includes(section.id)}
                      onChange={() => handlePermissionChange(section.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`perm-${section.id}`} className="ml-2 text-sm font-medium text-gray-700">{section.name}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
              <button type="button" onClick={loadUsers} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                Cancelar
              </button>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                {selectedUser ? 'Guardar Cambios' : 'Agregar Usuario'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UsersView;