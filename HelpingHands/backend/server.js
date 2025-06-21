require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = 5000;

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = 'whatsapp:' + process.env.TWILIO_PHONE;
const twilioClient = twilio(accountSid, authToken);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));

const VolunteerSchema = new mongoose.Schema({
  name: String,
  age: Number,
  phone: String,
  email: String,
  availability: String,
  motivation: String,
  latitude: Number,
  longitude: Number,
  photo: String,
});

const Volunteer = mongoose.model('volunteers', VolunteerSchema, 'volunteers');

const liveLocations = new Map();

io.on('connection', (socket) => {
  console.log('Socket client connected');

  socket.on('volunteerLiveLocation', ({ phone, latitude, longitude }) => {
    liveLocations.set(phone, { latitude, longitude });
    console.log(`Live location updated for ${phone}:`, latitude, longitude);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.post('/api/volunteer', async (req, res) => {
  try {
    const newVolunteer = new Volunteer({ ...req.body });
    await newVolunteer.save();
    res.status(200).json({ message: 'Volunteer registered successfully' });
  } catch (err) {
    console.error('Volunteer Registration Error:', err);
    res.status(500).json({ error: 'Failed to register volunteer' });
  }
});

app.post('/api/request-help', async (req, res) => {
  const { lat, lng, serviceType } = req.body;
  console.log('Client location:', lat, lng);

  try {
    const volunteers = await Volunteer.find();
    let nearest = null;
    let minDist = Infinity;

    volunteers.forEach((vol) => {
      let volLat = parseFloat(vol.latitude);
      let volLng = parseFloat(vol.longitude);

      const liveLoc = liveLocations.get(vol.phone);
      if (liveLoc) {
        volLat = liveLoc.latitude;
        volLng = liveLoc.longitude;
      }

      if (!isNaN(volLat) && !isNaN(volLng)) {
        const dist = Math.sqrt((lat - volLat) ** 2 + (lng - volLng) ** 2);
        if (dist < minDist) {
          minDist = dist;
          nearest = vol;
        }
      }
    });

    if (!nearest) {
      return res.status(404).json({ message: 'No volunteers available. Try again later.' });
    }

    let phoneDigits = nearest.phone.replace(/\D/g, '');
    if (phoneDigits.length === 12 && phoneDigits.startsWith('91')) {
      phoneDigits = phoneDigits.slice(2);
    }

    const phoneWithWhatsApp = 'whatsapp:+91' + phoneDigits;

    await twilioClient.messages.create({
      from: twilioPhone,
      to: phoneWithWhatsApp,
      body: `New Help Request: ${serviceType}\nLocation: (${lat}, ${lng})\nReply YES to accept or NO to decline.`,
    });

    res.status(200).json({ message: 'Volunteer notified via WhatsApp.' });
  } catch (err) {
    console.error('Help Request Error:', err);
    res.status(500).json({ error: 'Failed to process help request' });
  }
});

app.post('/whatsapp/reply', async (req, res) => {
  console.log('WhatsApp Reply:', req.body);
  const incomingMsg = req.body.Body?.trim().toLowerCase();
  const from = req.body.From;

  if (!from) return res.sendStatus(400);

  const phone = from.replace('whatsapp:+', '').slice(-10);
  const volunteer = await Volunteer.findOne({ phone: { $regex: phone + '$' } });

  if (incomingMsg === 'yes') {
    if (volunteer) {
      await twilioClient.messages.create({
        from: twilioPhone,
        to: from,
        body: 'Thanks for accepting!',
      });

      io.emit('volunteerAccepted', {
        name: volunteer.name,
        phone: volunteer.phone,
        email: volunteer.email,
        latitude: volunteer.latitude,
        longitude: volunteer.longitude,
        photo: volunteer.photo,
      });
    } else {
      await twilioClient.messages.create({
        from: twilioPhone,
        to: from,
        body: 'Could not find your details in the system.',
      });
    }
  } else if (incomingMsg === 'no') {
    await twilioClient.messages.create({
      from: twilioPhone,
      to: from,
      body: 'You declined the request. We’ll notify someone else.',
    });
  }

  res.send('<Response></Response>');
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
