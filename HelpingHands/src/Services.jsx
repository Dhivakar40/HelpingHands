import React, { useEffect, useState } from 'react';
import './Services.css';
import Swal from 'sweetalert2';

import groceryImg from './assets/grocery.png';
import medicineImg from './assets/medicine.png';
import choresImg from './assets/chores.png';
import companionImg from './assets/companionship.png';

function Services() {
  const [clientLocation, setClientLocation] = useState({ lat: null, lng: null });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setClientLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    });
  }, []);

  const handleServiceRequest = (serviceType) => {
    if (!clientLocation.lat || !clientLocation.lng) {
      Swal.fire('Location not ready', 'Please allow location access.', 'warning');
      return;
    }

    fetch('http://localhost:5000/api/request-help', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: clientLocation.lat,
        lng: clientLocation.lng,
        serviceType,
      }),
    })
      .then(res => res.json())
      .then(data => {
        Swal.fire('Request Sent', data.message || 'Volunteer will be notified.', 'success');
      })
      .catch(() => {
        Swal.fire('Error', 'Failed to send help request.', 'error');
      });
  };

  const services = [
    { title: 'Grocery Shopping', description: 'Groceries and essentials', image: groceryImg },
    { title: 'Medication Pickup', description: 'Prescriptions on time', image: medicineImg },
    { title: 'Household Chores', description: 'Light cleaning, laundry', image: choresImg },
    { title: 'Companionship Visits', description: 'Friendly visits', image: companionImg },
  ];

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
            <button className="request-button" onClick={() => handleServiceRequest(service.title)}>
              Request This
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Services;