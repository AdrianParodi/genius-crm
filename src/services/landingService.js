const db = require('../data/db')
const templateService = require('./templateService')

function getAllLandings() {
  return db.landings.map(landing => ({
    ...landing,
    leadCount: 0
  }))
};

function getAllLandingsByClient(client) {

  const landing = db.landings.filter(landing => landing.client === client);
  if (landing.length === 0) {
    const error = new Error(`Landing not found: ${client}`);
    error.statusCode = 404;
    throw error;
  }
  return landing;

};

function getLandingById(id) {
    
  const landing = db.landings.find(l => l.id === id);

  return landing;
};

function editStatusLanding(id, status){

  const landing = getLandingById(id);
  
  if (!landing) {
    const error = new Error(`Landing not found: ${id}`);
    error.statusCode = 404;
    throw error;
  }

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
  getLandingById(landingId)
  return db.leads.filter(l => l.landingId === Number(landingId))
};

function createLead(landingId, data) {
  getLandingById(landingId)

  const lead = {
    id: db.nextLeadId++,
    landingId: Number(landingId),
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    message: data.message || null,
    createdAt: new Date().toISOString()
  }

  db.leads.push(lead)
  return lead
};

module.exports = { getAllLandings, getAllLandingsByClient, getLandingById, createLanding, getLandingPreview, getLeadsByLanding, createLead, editStatusLanding };

