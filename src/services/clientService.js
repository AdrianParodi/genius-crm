const db = require('../data/db')

// Función para filtrar clientes por nombre
function filterClientsByName(searchTerm) {
  const term = typeof searchTerm === 'string' ? searchTerm.toLowerCase() : '';
  return db.clients.filter(client => 
    client.name.toLowerCase().includes(term)
  );
}

function getAllClients() {
  return db.clients
}

function createClient(name, folder) {
  // Validar duplicados por nombre
  const clientExist = db.clients.find(t => t.name === name);
  if(clientExist){
    const err = new Error(`El nombre "${name}" ya existe. Intente nuevamente.`)
    err.statusCode = 400
    throw err
  }
  
  const nextId = db.clients.length + 1;
  
  // Solo validar estructura básica, las validaciones específicas van en el route
  return {
    id: nextId,
    name,
    folder
  }
}

function updateClient(id, name, folder = null) {
  const clientIndex = db.clients.findIndex(c => c.id === Number(id));
  
  if (clientIndex === -1) {
    const err = new Error(`Cliente no encontrado: ID ${id}`)
    err.statusCode = 404
    throw err
  }

  let updatedClient = { ...db.clients[clientIndex] };

  if (name !== undefined) {
    // Solo actualizar si se pasa el nombre
    updatedClient.name = name;
  }

  if (folder !== undefined && folder !== null) {
    updatedClient.folder = folder;
  }

  db.clients[clientIndex] = updatedClient;
  return updatedClient;
}

function deleteClient(id) {
  const client = db.clients.find(t => t.id === Number(id))

  if (!client) {
    const err = new Error(`Cliente no encontrado: ID ${id}`)
    err.statusCode = 404
    throw err
  }

  const index = db.clients.findIndex(c => c.id === Number(id));
  db.clients.splice(index, 1);
  
  return { message: "Cliente eliminado con exito!" }
}

function getClientById(id) {
  const client = db.clients.find(c => c.id === Number(id))
  if (!client) {
    const err = new Error(`Cliente no encontrado: ID ${id}`)
    err.statusCode = 404
    throw err
  }
  return client
}

module.exports = { getAllClients, createClient, updateClient, deleteClient, getClientById, filterClientsByName }
