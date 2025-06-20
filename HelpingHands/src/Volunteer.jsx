import React, { useState, useEffect } from 'react';
import './Volunteer.css';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function Volunteer() {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    email: '',
    availability: '',
    motivation: '',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    let map;
    let marker;

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Update form data state
          setFormData((prevData) => ({
            ...prevData,
            latitude,
            longitude
          }));

          // Initialize or update Leaflet map
          if (!map) {
            map = L.map('map').setView([latitude, longitude], 15);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution: '&copy; OpenStreetMap contributors',
            }).addTo(map);

            marker = L.marker([latitude, longitude])
              .addTo(map)
              .bindPopup("You are here")
              .openPopup();
          } else {
            marker.setLatLng([latitude, longitude]);
            map.setView([latitude, longitude]);
          }

          // Send live location to backend
          axios.post("http://localhost:5000/update-location", {
            name: formData.name || "Unnamed Volunteer",
            lat: latitude,
            lng: longitude
          }).catch((err) => console.error("Live location error:", err));
        },
        (error) => {
          console.error('Geolocation error:', error.message);
          alert('Location access denied');
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }, [formData.name]); // Updates live tracking when name is filled

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/volunteer', formData);
      alert('Thank you for registering as a volunteer!');
      setFormData({
        name: '',
        age: '',
        phone: '',
        email: '',
        availability: '',
        motivation: '',
        latitude: '',
        longitude: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error. Please try again.');
    }
  };

  return (
    <div className="volunteer-page">
      <h2 className="volunteer-title">Join as a Volunteer</h2>

      <div id="map" style={{ height: "400px", width: "100%", marginBottom: "20px" }}></div>

      <form className="volunteer-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="availability"
          placeholder="Availability (e.g., Weekends)"
          value={formData.availability}
          onChange={handleChange}
        />
        <textarea
          name="motivation"
          placeholder="Why do you want to volunteer?"
          value={formData.motivation}
          onChange={handleChange}
        ></textarea>

        <input
          type="text"
          name="latitude"
          placeholder="Latitude"
          value={formData.latitude}
          onChange={handleChange}
          readOnly
        />
        <input
          type="text"
          name="longitude"
          placeholder="Longitude"
          value={formData.longitude}
          onChange={handleChange}
          readOnly
        />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Volunteer;
