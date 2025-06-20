import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Swal from 'sweetalert2';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';


const socket = io('http://localhost:5000');

function ClientRequest() {
  const [clientLocation, setClientLocation] = useState({ lat: '', lng: '' });
  const [volunteerInfo, setVolunteerInfo] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setClientLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          alert('Please enable location');
          console.error(err);
        }
      );
    }
  }, []);

  useEffect(() => {
    socket.on('volunteerAccepted', (data) => {
      setVolunteerInfo(data);
      Swal.fire({
        title: 'Volunteer Found!',
        html: `
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <p><strong>Email:</strong> ${data.email}</p>
        `,
        imageUrl: data.photo || '',
        imageHeight: 100,
        imageAlt: 'Volunteer photo',
        confirmButtonText: 'OK'
      });
    });
  }, []);

  const handleRequest = () => {
    if (!clientLocation.lat || !clientLocation.lng) {
      alert('Location not ready yet');
      return;
    }

    socket.emit('clientHelpRequest', {
      lat: clientLocation.lat,
      lng: clientLocation.lng
    });

    Swal.fire({
      title: 'Request Sent',
      text: 'Waiting for a nearby volunteer.',
      icon: 'info',
      showConfirmButton: false,
      allowOutsideClick: false,
      timer: 15000
    });
  };

  return (
    <div className="client-page">
      <h2>Request a Volunteer</h2>
      <button onClick={handleRequest}>Send Help Request</button>

      {volunteerInfo && (
        <div className="volunteer-details">
          <h3>Assigned Volunteer</h3>
          <p>Name: {volunteerInfo.name}</p>
          <p>Phone: {volunteerInfo.phone}</p>
          <p>Email: {volunteerInfo.email}</p>
          {volunteerInfo.photo && <img src={volunteerInfo.photo} alt="Volunteer" height={100} />}
        </div>
      )}
      {volunteerInfo?.location && (
  <div style={{ height: '400px', marginTop: '20px' }}>
    <MapContainer
      center={[volunteerInfo.location.latitude, volunteerInfo.location.longitude]}
      zoom={15}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[volunteerInfo.location.latitude, volunteerInfo.location.longitude]}>
        <Popup>
          Volunteer: {volunteerInfo.name}
        </Popup>
      </Marker>
    </MapContainer>
  </div>
)}

    </div>
  );
}

export default ClientRequest;
