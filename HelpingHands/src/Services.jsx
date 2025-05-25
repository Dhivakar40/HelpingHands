import React from 'react';
import './Services.css';
import groceryImg from './assets/grocery.png';
import medicineImg from './assets/medicine.png';
import choresImg from './assets/chores.png';
import companionImg from './assets/companionship.png';

function Services(){
    const services=[
        {
            title:'Grocery Shopping',
            description : 'We help you in purchasing groceries and household essentials',
            image:groceryImg
        },
        {
            title:'Medication Pickup',
            description : 'Get your prescriptions picked up and delivered on time.',
            image:medicineImg
        },
        {
            title: 'Household Chores',
            description: 'Assistance with light cleaning, laundry, and minor maintenance.',
            image:choresImg
        },
        {
            title: 'Companionship Visits',
            description: 'Spend quality time with friendly volunteers who care.',
            image:companionImg
        }
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
            <button className="request-button">Request This</button>
          </div>
        ))}
      </div>
    </div>
  );
}

 export default Services