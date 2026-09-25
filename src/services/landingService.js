const db = require('../data/db')
const templateService = require('./templateService')

//  Function to normalize strings for comparison, removing accents and converting to lowercase
function normalize(str) {
  return str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function getAllLandings() {
  return db.landings.map(landing => ({
    ...landing,
    leadCount: 0
  }))
};

function getAllLandingsByClient(client) { 
  const normalizedClient = normalize(client);
  const landing = db.landings.filter(landing => landing.client.toLowerCase().includes(normalizedClient));
   
  if (landing.length === 0) {
    const error = new Error(`Landings not found: ${client}`);
    error.statusCode = 404;
    throw error;
  }
  return landing;

};

function getLandingById(id) {
    
  const landing = db.landings.find(l => l.id === id);
  if (!landing) {
    const error = new Error(`Landing not found: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  return landing;
};

function editStatusLanding(id, status){

  const landing = getLandingById(id);

  landing.status = status;
  
  return landing;
};

function createLanding(data) {
  const template = templateService.getTemplateById(data.templateId)

  const landing = {
    id: db.nextLandingId++,
    templateId: template.id,
    name: data.name,
    client: data.client,
    status: 'draft',
    fields: data.fields || {},
    createdAt: new Date().toISOString()
  }

  db.landings.push(landing)
  return landing
};

function getLandingPreview(id) {
  const landing = getLandingById(id)
  const template = templateService.getTemplateById(landing.templateId)

  let html = template.html

  Object.keys(landing.fields).forEach(key => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    html = html.replace(regex, landing.fields[key] || '')
  })

  html = html.replace(/\{\{clientName\}\}/g, landing.client || '')

  return html
};

function getLeadsByLanding(landingId) {

  const landing = getLandingById(landingId);
  const leads = db.leads.filter(l => l.landingId === landing.id);
  
  if (leads.length === 0) {
    const error = new Error(`Leads not found`);
    error.statusCode = 404;
    throw error;
  }

  return leads
};

function getLeadsByLanding(landingId) {

  const landing = getLandingById(landingId);
  const leads = db.leads.filter(l => l.landingId === landing.id);

  return leads
};

function getCountleads() {

  return db.leads.map(leads => ({
    ...leads,
  }))
};

function createLead(landingId, data) {
  const landing = getLandingById(landingId)
  const emailExist = db.leads.find(lead => lead.email === data.email && lead.landingId === landing.id);

  if (emailExist) {
    const error = new Error(`Email ya registrado`);
    error.statusCode = 404;
    throw error;
  }

  const lead = {
    id: db.nextLeadId++,
    landingId: Number(landingId),
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone || null,
    message: data.message || null,
    createdAt: new Date().toISOString()
  }

  db.leads.push(lead)
  return lead
};

module.exports = { getAllLandings, getAllLandingsByClient, getLandingById, createLanding, getLandingPreview, getLeadsByLanding, createLead, editStatusLanding, getCountleads };

