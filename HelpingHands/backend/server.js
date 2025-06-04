const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb+srv://HelpingHands:HelpingHands007@cluster0.dnvqjyp.mongodb.net/helpinghands?retryWrites=true&w=majority&appName=Cluster0', 
{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Schema
const volunteerSchema = new mongoose.Schema({
  name: String,
  age: String,
  phone: String,
  email: String,
  availability: String,
  motivation: String
});


const Volunteer = mongoose.model('Volunteer', volunteerSchema);

// API Route
app.post('/api/volunteer', async (req, res) => {
    try {
        const volunteer = new Volunteer(req.body);
        await volunteer.save();
        res.status(201).send("Volunteer registered");
    } catch (err) {
        res.status(400).send("Error saving volunteer");
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));
