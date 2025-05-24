import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FirstPage from './FirstPage';
import Services from './Services';
import Volunteer from './Volunteer'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FirstPage />} />
        <Route path="/services" element={<Services />} />
        <Route path="/volunteer" element={<Volunteer />} /> 
      </Routes>
    </Router>
  );
}

export default App;
