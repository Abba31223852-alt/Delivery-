const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const TRACKING_FILE = './tracking.json';
const MESSAGES_FILE = './messages.json';

function loadTracking() {
  if (!fs.existsSync(TRACKING_FILE)) {
    const sample = [
      { tracking_number: "SD-2024-001234", status: "In Transit", location: "Lagos Sorting Center", updated_at: new Date().toISOString() },
      { tracking_number: "SD-2024-005678", status: "Out for Delivery", location: "Abuja Distribution Hub", updated_at: new Date().toISOString() },
      { tracking_number: "SD-2024-009012", status: "Delivered", location: "Port Harcourt", updated_at: new Date().toISOString() }
    ];
    fs.writeFileSync(TRACKING_FILE, JSON.stringify(sample, null, 2));
    return sample;
  }
  return JSON.parse(fs.readFileSync(TRACKING_FILE));
}

app.get('/api/track/:trackingNumber', (req, res) => {
  const trackingData = loadTracking();
  const found = trackingData.find(item => item.tracking_number === req.params.trackingNumber);
  if (!found) return res.status(404).json({ error: "Tracking number not found" });
  res.json(found);
});

app.post('/api/contact', (req, res) => {
  const { name, phone, email, service, message } = req.body;
  const newMessage = { name, phone, email, service, message, created_at: new Date().toISOString() };

  let messages = [];
  if (fs.existsSync(MESSAGES_FILE)) {
    messages = JSON.parse(fs.readFileSync(MESSAGES_FILE));
  }
  messages.push(newMessage);
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));

  console.log("New message from " + name + " (" + phone + ")");
  res.json({ success: true, message: "Thank you! We will contact you shortly." });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log("SwiftDrop server running: http://localhost:" + PORT);
  console.log("Test tracking: SD-2024-001234");
});
