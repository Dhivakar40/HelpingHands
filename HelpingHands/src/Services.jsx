import React, { useEffect, useState } from 'react';
import './Services.css';
import groceryImg from './assets/grocery.png';
import medicineImg from './assets/medicine.png';
import choresImg from './assets/chores.png';
import companionImg from './assets/companionship.png';
import Swal from 'sweetalert2';
import { io } from 'socket.io-client';
import axios from 'axios';

const socket = io("https://f6cb-103-122-15-220.ngrok-free.app", {
  transports: ['websocket'],
  path: '/socket.io', 
  reconnectionAttempts: 5,
  timeout: 10000,
});

socket.on('connect', () => {
  console.log('Socket.IO connected');
});

socket.on('connect_error', (err) => {
  console.error('Socket.IO connection error:', err.message);
});


function Services() {
  const [clientLocation, setClientLocation] = useState({ lat: null, lng: null });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setClientLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
  }, []);

  socket.on('connect', () => {
  console.log('Connected to backend socket.io');
});

  useEffect(() => {
    socket.on('volunteerAccepted', (data) => {
  Swal.fire({
    title: 'Volunteer Found!',
    html: `
      ${data.photo ? `<img src="${data.photo}" style="width:100px;height:100px;border-radius:50%;margin-bottom:10px;" />` : ''}
      <br><br>
      <b>Name:</b> ${data.name}<br>
      <b>Phone:</b> ${data.phone}<br>
      <b>Email:</b> ${data.email}<br><br>
      <a href="tel:${data.phone}" style="display:inline-block;padding:8px 12px;background:#4caf50;color:white;border-radius:5px;text-decoration:none;">📞 Call Volunteer</a>
    `,
    icon: 'success',
    showConfirmButton: true
  });
});

    return () => {
      socket.off('volunteerAccepted');
    };
  }, []);

  const services = [
    {
      title: 'Grocery Shopping',
      description: 'We help you in purchasing groceries and household essentials.',
      image: groceryImg,
    },
    {
      title: 'Medication Pickup',
      description: 'Get your prescriptions picked up and delivered on time.',
      image: medicineImg,
    },
    {
      title: 'Household Chores',
      description: 'Assistance with light cleaning, laundry, and minor maintenance.',
      image: choresImg,
    },
    {
      title: 'Companionship Visits',
      description: 'Spend quality time with friendly volunteers who care.',
      image: companionImg,
    },
  ];

  const handleServiceRequest = async (serviceType) => {
    if (!clientLocation.lat || !clientLocation.lng) {
      Swal.fire('Location not available', 'Please allow location access.', 'warning');
      return;
    }

    try {
      await axios.post("https://f6cb-103-122-15-220.ngrok-free.app/api/request-help",
  {
    lat: clientLocation.lat,
    lng: clientLocation.lng,
    serviceType,
  }
);



      Swal.fire('Request Sent', 'Waiting for a nearby volunteer to accept...', 'info');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        Swal.fire('No Volunteers Found', 'Try again later.', 'error');
      } else {
        Swal.fire('Error', 'Something went wrong.', 'error');
      }
    }
  };

  return (
    <div className="services-page">
      <h2 className="services-title">Available Services</h2>
      <h3 className="service-subtitle">One Step Away</h3>
      <div className="services-list">
        {services.map((service, index) => (
          <div key={index} className="service-card">
            <img src={service.image} alt={service.title} className="service-image" />
            <h3 className="service-title">{service.title}</h3>
            <p className="service-description">{service.description}</p>
            <button
              className="request-button"
              onClick={() => handleServiceRequest(service.title)}
            >
              Request This
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Services;
