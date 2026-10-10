const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const TRACKING_FILE = './tracking.json';
const MESSAGES_FILE = './messages.json';
const ORDERS_FILE = './orders.json';

function loadJSON(file, def) {
  if (!fs.existsSync(file)) { fs.writeFileSync(file, JSON.stringify(def, null, 2)); return def; }
  return JSON.parse(fs.readFileSync(file));
}
function saveJSON(file, data) { fs.writeFileSync(file, JSON.stringify(data, null, 2)); }

app.get('/api/track/:trackingNumber', (req, res) => {
  const trackingData = loadJSON(TRACKING_FILE, []);
  const found = trackingData.find(item => item.tracking_number === req.params.trackingNumber);
  if (!found) return res.status(404).json({ error: "Tracking number not found" });
  res.json(found);
});

app.post('/api/contact', (req, res) => {
  const messages = loadJSON(MESSAGES_FILE, []);
  messages.push({ id: Date.now(), ...req.body, created_at: new Date().toISOString() });
  saveJSON(MESSAGES_FILE, messages);
  console.log("New message from " + req.body.name);
  res.json({ success: true, message: "Thank you! We will contact you shortly." });
});

app.post('/api/order', (req, res) => {
  const orders = loadJSON(ORDERS_FILE, []);
  const order = { id: Date.now(), ...req.body, status: 'Pending', created_at: new Date().toISOString() };
  orders.push(order);
  saveJSON(ORDERS_FILE, orders);
  console.log("New order from " + order.customer_name + " for " + order.phone_model);
  res.json({ success: true, message: "Order received! We will call you shortly." });
});

app.get('/api/admin/orders', (req, res) => res.json(loadJSON(ORDERS_FILE, [])));
app.get('/api/admin/messages', (req, res) => res.json(loadJSON(MESSAGES_FILE, [])));

app.post('/api/admin/order/:id/status', (req, res) => {
  const orders = loadJSON(ORDERS_FILE, []);
  const order = orders.find(o => o.id == req.params.id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  order.status = req.body.status;
  saveJSON(ORDERS_FILE, orders);
  res.json({ success: true });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log("Easy Buy server running on port " + PORT);
});
