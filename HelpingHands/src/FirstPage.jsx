import React from 'react'
import './FirstPage.css'
import {useNavigate} from 'react-router-dom';

function FirstPage() {
  const navigate=useNavigate();
  const handleElderClick=()=>{
    navigate('/Services');
  };
  const handleVolunteerClick=()=>{
    navigate('/Volunteer');
  };
  return(
    <div className="background-wrapper">
        <div className="bg-image"></div>
        <div className="overlay"></div>
    <div className="container">
      <h1 className="title">Helping Hands</h1>
      <p className="subtitle">"Your Needs. 
Our Riders. 
Just a Click Away."
</p>
      <div className="button-group">
        <button className="action-button" onClick={handleElderClick}>
          Take up Services
        </button>
        <button className="action-button volunteer" onClick={handleVolunteerClick}>
          Join as Volunteer
        </button>
      </div>
    </div>
    </div>
  );
   
}

export default FirstPage
