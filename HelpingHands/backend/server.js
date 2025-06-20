require('dotenv').config();
console.log('MONGO_URI is:', process.env.MONGO_URI);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const { urlencoded } = require('body-parser');
const MessagingResponse = twilio.twiml.MessagingResponse;

const app = express();
const PORT = 5000;

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE;
const twilioClient = twilio(accountSid, authToken);

app.use(cors());
app.use(bodyParser.json());
app.use(urlencoded({ extended: false }));

mongoose.connect(process.env.MONGO_URI)
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

app.post('/api/volunteer', async (req, res) => {
  try {
    const newVolunteer = new Volunteer(req.body);
    await newVolunteer.save();
    res.status(200).json({ message: 'Volunteer registered successfully' });
  } catch (err) {
    console.error('Volunteer save error:', err); 
    res.status(500).json({ error: 'Failed to register volunteer' });
  }
});

let pendingRequests = {}; 

app.post('/api/request-help', async (req, res) => {
  const { lat, lng, serviceType } = req.body;
  try {
    const volunteers = await Volunteer.find();
    let minDist = Infinity;
    let nearest = null;

    volunteers.forEach(vol => {
      const dist = Math.sqrt(
        Math.pow(lat - vol.latitude, 2) +
        Math.pow(lng - vol.longitude, 2)
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = vol;
      }
    });

    if (nearest && nearest.phone) {
      const userId = Date.now();
      pendingRequests[nearest.phone] = { lat, lng, serviceType, userId };

      await twilioClient.messages.create({
        body: `Help Request: ${serviceType}\nLocation: (${lat}, ${lng})\nReply YES to accept or NO to decline.`,
        from: twilioPhone,
        to: nearest.phone.startsWith('+') ? nearest.phone : '+91' + nearest.phone
      });
      res.status(200).json({ message: 'Volunteer notified via SMS.' });
    } else {
      res.status(404).json({ message: 'No volunteers available.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to process help request' });
  }
});

app.post('/sms/reply', async (req, res) => {
  const userReply = req.body.Body.trim().toLowerCase();
  const fromPhone = req.body.From.replace('+91', '');

  const twiml = new MessagingResponse();

  if (userReply === 'yes' && pendingRequests[fromPhone]) {
    const volunteer = await Volunteer.findOne({ phone: fromPhone });
    if (volunteer) {
      
      console.log(`Volunteer accepted: ${volunteer.name}`);
    }
    twiml.message('Thanks! You are now connected with the requester.');
    delete pendingRequests[fromPhone];
  } else if (userReply === 'no') {
    twiml.message('You declined the help request.');
    delete pendingRequests[fromPhone];
  } else {
    twiml.message("Invalid response. Reply YES to accept or NO to decline.");
  }

  res.type('text/xml').send(twiml.toString());
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
