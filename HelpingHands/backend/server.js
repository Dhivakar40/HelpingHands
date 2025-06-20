const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(
  'mongodb+srv://Dhiva:HelpingHands007@cluster007.8i5hcjd.mongodb.net/helpinghands_live?retryWrites=true&w=majority&appName=Cluster007',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
).then(() => console.log('MongoDB Connected'))
 .catch((err) => console.error(err));

const volunteerSchema = new mongoose.Schema({
  name: String,
  age: String,
  phone: String,
  email: String,
  availability: String,
  motivation: String,
  latitude: String,
  longitude: String,
  photo: String, 
});

const Volunteer = mongoose.model('Volunteer', volunteerSchema);

app.post('/api/volunteer', async (req, res) => {
  try {
    const volunteer = new Volunteer(req.body);
    await volunteer.save();
    res.status(201).send('Volunteer registered');
  } catch (err) {
    console.error(err);
    res.status(400).send('Error saving volunteer');
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

let liveVolunteers = {}; 
let clientRequests = {}; 

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function findNearestVolunteer(clientLat, clientLng) {
  let nearest = null;
  let minDist = Infinity;

  for (const id in liveVolunteers) {
    const vol = liveVolunteers[id];
    const dist = getDistanceFromLatLonInKm(clientLat, clientLng, vol.latitude, vol.longitude);
    if (dist < minDist) {
      minDist = dist;
      nearest = { ...vol, id };
    }
  }

  return nearest;
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('volunteerLocation', ({ id, latitude, longitude }) => {
    liveVolunteers[id] = { latitude, longitude, socketId: socket.id };
    console.log(`Live update: ${id} @ (${latitude}, ${longitude})`);
  });

  socket.on('clientHelpRequest', ({ lat, lng }) => {
    clientRequests[socket.id] = { lat, lng };
    const nearest = findNearestVolunteer(lat, lng);
    if (!nearest) return;

    io.to(nearest.socketId).emit('taskRequest', {
      clientLat: lat,
      clientLng: lng,
      clientMessage: 'Someone nearby needs help!',
      clientSocketId: socket.id
    });

    console.log(`Task request sent to ${nearest.id}`);
  });

  socket.on('taskAccepted', ({ id, latitude, longitude, clientSocketId }) => {
    Volunteer.findOne({ phone: id }).then((volunteer) => {
      if (!volunteer) return;

      io.to(clientSocketId).emit('volunteerAccepted', {
        name: volunteer.name,
        phone: volunteer.phone,
        email: volunteer.email,
        photo: volunteer.photo || '',
        location: { latitude, longitude }
      });

      console.log(`Volunteer ${id} accepted. Info sent to client.`);
    });
  });

  socket.on('taskRejected', ({ id }) => {
    console.log(`Volunteer ${id} rejected the task`);
  
  });

  socket.on('disconnect', () => {
    for (const id in liveVolunteers) {
      if (liveVolunteers[id].socketId === socket.id) {
        delete liveVolunteers[id];
        console.log(`Volunteer ${id} disconnected`);
        break;
      }
    }
    delete clientRequests[socket.id];
  });
});

server.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
