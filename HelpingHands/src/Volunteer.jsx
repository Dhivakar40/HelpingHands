import React, { useState } from 'react';
import './Volunteer.css';

function Volunteer() {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    email: '',
    availability: '',
    motivation: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for registering as a volunteer!');
  };

  return (
    <div className="volunteer-page">
      <h2 className="volunteer-title">Join as a Volunteer</h2>
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
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Volunteer;