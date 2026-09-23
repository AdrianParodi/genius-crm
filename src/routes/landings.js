const express = require('express');
const cors = require('cors');
const app = express()
const landingService = require('../services/landingService')

// require('dotenv').config();

app.use(cors({

  // origin: process.env.FRONT
}))

/**
 * @swagger
 * /api/landings:
 *   get:
 *     summary: Listar todas las landing pages
 *     tags: [Landings]
 *     responses:
 *       200:
 *         description: Lista de landings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Landing'
 */
app.get('/', (req, res, next) => {
  try {
    res.json(landingService.getAllLandings())
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/landings/summary:
 *   get:
 *     summary: Listar todos los leads
 *     tags: [Leads]
 *     responses:
 *       200:
 *         description: Listar los leads
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Leads'
 */
app.get('/summary', (req, res, next) => {
  try {
    res.json(landingService.getCountleads())
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/landings:
 *   post:
 *     summary: Crear una landing page desde un template
 *     tags: [Landings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLandingRequest'
 *           example:
 *             templateId: 1
 *             name: "Hot Sale 2026 - SuenoSimple"
 *             client: "SuenoSimple"
 *             fields:
 *               title: "Hot Sale 2026"
 *               subtitle: "Hasta 50% off en colchones"
 *               ctaText: "Ver ofertas"
 *               ctaUrl: "https://suenosimple.com/hot-sale"
 *               eventDate: "2026-05-20"
 *               heroImageUrl: "https://via.placeholder.com/1200x400"
 *     responses:
 *       201:
 *         description: Landing creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Landing'
 *       404:
 *         description: Template no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/', (req, res, next) => {
  try {
    const landing = landingService.createLanding(req.body)
    res.status(201).json(landing)
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /api/landings/{id}/preview:
 *   get:
 *     summary: Renderizar la landing como HTML
 *     description: Retorna el HTML generado de la landing con los campos del cliente aplicados. Util para previsualizar antes de publicar.
 *     tags: [Landings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: HTML renderizado
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       404:
 *         description: Landing no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/:id/preview', (req, res, next) => {
  
  const { id } = req.params;
  const parseId = parseInt(id);

  if(isNaN(parseId)){
    return res.status(400).json({message: "Id invalido"})
  }

  try {
    const html = landingService.getLandingPreview(id)
    res.setHeader('Content-Type', 'text/html')
    res.send(html)
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/landings/{id}/leads:
 *   get:
 *     summary: Listar leads captados por la landing
 *     tags: [Landings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de leads
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lead'
 *       404:
 *         description: Landing no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/:id/leads', (req, res, next) => {

  const { id } = req.params;
  const parseId = parseInt(id);

  if(isNaN(parseId)){
    return res.status(400).json({message: "Id invalido"})
  }

  try {
    res.json(landingService.getLeadsByLanding(parseId))
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /api/landings/{id}/leads:
 *   post:
 *     summary: Registrar un lead en la landing
 *     description: Se usa para simular el envío del formulario de contacto de la landing.
 *     tags: [Landings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLeadRequest'
 *           example:
 *             name: "Maria Gomez"
 *             email: "maria@gmail.com"
 *             phone: "1134567890"
 *             message: null
 *     responses:
 *       201:
 *         description: Lead registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lead'
 *       400:
 *         description: Datos inválidos (name o email faltante/inválido)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Landing no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     409:
 *         description: El email ya está registrado en esta landing
 */
app.post('/:id/leads', (req, res, next) => {
  const { name, email } = req.body

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ message: "El campo 'name' es requerido." })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    return res.status(400).json({ message: "El campo 'email' es requerido y debe tener un formato válido." })
  }

  try {
    const lead = landingService.createLead(req.params.id, req.body)
    res.status(201).json(lead)
  } catch (err) {
    next(err)
  }
});

/**
 * @swagger
 * /api/landings/id/{id}:
 *   get:
 *     summary: Obtener una landing por ID
 *     tags: [Landings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Landing encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Landing'
 *       404:
 *         description: Landing no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/id/:id', (req, res, next) => {

  const { id } = req.params;
  const parseId = parseInt(id);

  if(isNaN(parseId)){
    return res.status(400).json({message: "Id invalido"})
  }

  try {
    const landing = landingService.getLandingById(parseId);
    res.status(200).json(landing)
  } catch (error) {
    next(error)
  }
});

/**
 * @swagger
 * /api/landings/client/{client}:
 *   get:
 *     summary: Obtener una landing por cliente
 *     tags: [Landings]
 *     parameters:
 *       - in: path
 *         name: client
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de landings por cliente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Landing'
 *       404:
 *         description: Cliente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/client/:client', (req, res, next) => {

  const {client} = req.params;

  if(client.length < 3 || client.length > 30){
    return res.status(400).json({message: "El campo 'client' debe contener entre 3 y 30."})
  }

  try {
    res.json(landingService.getAllLandingsByClient(client))
  } catch (err) {
    next(err)
  }
});

/**
 * @swagger
 * /api/landings/{id}:
 *   patch:
 *     summary: Editar estado de una landing
 *     description: Se usa para editar el estado de una landing
 *     tags: [Landings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EditStatusLandingRequest'
 *           example:
 *             status: active
 *     responses:
 *       200:
 *         description: Estado de landing actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EditStatusLandingRequest'
 *       404:
 *         description: Landing no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.patch('/:id', (req, res, next) => {

  const { id } = req.params;
  const parseId = parseInt(id);
  const { status } = req.body;
  const estados = ['active', 'inactive', 'draft'];

  if(isNaN(parseId)){
    return res.status(400).json({message: "Id invalido."})
  }

  if(!status || typeof status !== "string"){
    return res.status(400).json({message: "El campo 'status' es obligatorio y debe ser un texto."})
  }

  if(!estados.includes(status.toLowerCase())){
    return res.status(400).json({message: "Estado invalido, intente nuevamente."})
  }

  try {
    const landing = landingService.editStatusLanding(parseId, status);
    res.status(200).json(landing)
  } catch (error) {
    next(error)
  }
});

module.exports = app;