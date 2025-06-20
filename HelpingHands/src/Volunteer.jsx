import React, { useEffect, useState } from 'react';
import './Volunteer.css';
import axios from 'axios';
import { io } from 'socket.io-client';
import Swal from 'sweetalert2';

const socket = io('http://localhost:5000'); 

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

  const [isRegistered, setIsRegistered] = useState(false);
  const [volunteerId, setVolunteerId] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          setFormData((prev) => ({
            ...prev,
            latitude,
            longitude
          }));

          if (isRegistered && volunteerId) {
            socket.emit('volunteerLocation', {
              id: volunteerId,
              latitude,
              longitude
            });
          }
        },
        (err) => {
          console.error('Location error:', err.message);
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      alert('Geolocation not supported by your browser');
    }
  }, [isRegistered, volunteerId]);

  useEffect(() => {
    socket.on('taskRequest', ({ clientLat, clientLng, clientMessage }) => {
      Swal.fire({
        title: 'New Task Request',
        text: clientMessage,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Accept',
        cancelButtonText: 'Reject',
        timer: 15000,
        timerProgressBar: true,
        willClose: () => {
          socket.emit('taskRejected', { id: volunteerId });
        }
      }).then((result) => {
        if (result.isConfirmed) {
          socket.emit('taskAccepted', {
            id: volunteerId,
            latitude: formData.latitude,
            longitude: formData.longitude
          });
          Swal.fire('Accepted!', 'You accepted the task.', 'success');
        } else {
          socket.emit('taskRejected', { id: volunteerId });
        }
      });
    });
  }, [formData.latitude, formData.longitude, volunteerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/volunteer', formData);
      alert('Thank you for registering as a volunteer!');
      setIsRegistered(true);
      setVolunteerId(formData.phone);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error. Please try again.');
    }
  };

  return (
    <div className="volunteer-page">
      <h2 className="volunteer-title">Join as a Volunteer</h2>
      <form className="volunteer-form" onSubmit={handleSubmit}>
        <input type="file" name="photo" accept="image/*" onChange={(e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prevData) => ({
            ...prevData,
            photo: reader.result,
        }));
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  }}
/>

        <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
        <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
        <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="text" name="availability" placeholder="Availability (e.g., Weekends)" value={formData.availability} onChange={handleChange} />
        <textarea name="motivation" placeholder="Why do you want to volunteer?" value={formData.motivation} onChange={handleChange}></textarea>
        <input type="text" name="latitude" placeholder="Latitude" value={formData.latitude} readOnly />
        <input type="text" name="longitude" placeholder="Longitude" value={formData.longitude} readOnly />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Volunteer;
