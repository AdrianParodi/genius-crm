const express = require('express')
const clientService = require('../services/clientService')
const { parse } = require('querystring')
const app = express()

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Listar todos los clientes disponibles
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Clients'
 */
app.get('/', (req, res, next) => {
  try {

    const clientes = clientService.getAllClients();
    res.json(clientes);
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /api/clients/{id}:
 *   get:
 *     summary: Obtener un cliente por ID
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       404:
 *         description: Cliente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/:id', (req, res, next) => {
  
  const {id} = req.params;
  const parseId = parseInt(id);
  
  if(isNaN(parseId)){
    return res.status(400).json({message: "Id invalido", statusCode: 400});
  }

  try {
    const client = clientService.getClientById(parseId);
    res.status(200).json(client);
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Crear un cliente
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClientRequest'
 *           example:
 *             name: "SuenoSimple"
 *             folder: "suenosimple"
 *     responses:
 *       201:
 *         description: Cliente creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       400:
 *         description: Invalido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cliente existente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/', (req, res, next) => {
  const {name, folder} = req.body;

  // Validaciones en el route
  if(!name || typeof name !== "string"){
    return res.status(400).json({message: "El campo 'nombre' es obligatorio y debe ser un texto.", statusCode: 400});
  }

  // const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÜñÑ\s]+$/;
  // if(!nameRegex.test(name)){
  //   return res.status(400).json({message: "El campo 'nombre' solo debe contener letras (con acentos) y espacios.", statusCode: 400});
  // }

  if(!folder || typeof folder !== "string"){
    return res.status(400).json({message: "El campo 'carpeta' es obligatorio y debe ser un texto.", statusCode: 400});
  }

  const folderRegex = /^[a-zA-ZáéíóúÁÉÍÓÜñÑ\s\-_]+$/;
  if(!folderRegex.test(folder)){
    return res.status(400).json({message: "El campo 'carpeta' solo debe contener letras.", statusCode: 400});
  }

  try {
    const cliente = clientService.createClient(name, folder);
    res.status(201).json(cliente);
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /api/clients/{id}:
 *   put:
 *     summary: Actualizar un cliente (reemplazo completo)
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateClientRequest'
 *           example:
 *             name: "TechStore"
 *             folder: "techstore"
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       400:
 *         description: Invalido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cliente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.put('/:id', (req, res, next) => {
  
  const {id} = req.params;
  const parseId = parseInt(id);
  const {name, folder} = req.body;
  
  if(isNaN(parseId)){
    return res.status(400).json({message: "Id invalido", statusCode: 400});
  }

  // Validación simple: el cliente debe existir
  const clientExists = clientService.getAllClients().some(c => c.id === parseId);
  if(!clientExists){
    return res.status(404).json({message: "Cliente no encontrado", statusCode: 404});
  }

  try {
    const updatedClient = clientService.updateClient(parseId, name, folder);
    res.status(200).json(updatedClient);
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /api/clients/{id}:
 *   patch:
 *     summary: Actualizar un cliente (solo los campos enviados)
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateClientRequest'
 *           example:
 *             name: "SuenoSimple"
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       404:
 *         description: Cliente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.patch('/:id', (req, res, next) => {
  
  const {id} = req.params;
  const parseId = parseInt(id);
  const {name, folder} = req.body;
  
  if(isNaN(parseId)){
    return res.status(400).json({message: "Id invalido", statusCode: 400});
  }

  // Validación simple: el cliente debe existir
  const clientExists = clientService.getAllClients().some(c => c.id === parseId);
  if(!clientExists){
    return res.status(404).json({message: "Cliente no encontrado", statusCode: 404});
  }

  try {
    const updatedClient = clientService.updateClient(parseId, name, folder);
    res.status(200).json(updatedClient);
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /api/clients/{id}:
 *   delete:
 *     summary: Eliminar un cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *             example:
 *               message: "Cliente eliminado con exito!"
 *       404:
 *         description: Cliente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.delete('/:id', (req, res, next) => {

  const {id} = req.params;
  const parseId = parseInt(id);
  
  if(isNaN(parseId)){
    return res.status(400).json({message: "Id invalido", statusCode: 400});
  }

  try {
    const client = clientService.deleteClient(parseId);
    res.status(200).json(client);
  } catch (err) {
    next(err)
  }
})

module.exports = app;
