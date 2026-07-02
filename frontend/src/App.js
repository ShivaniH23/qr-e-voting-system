// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUp from './Components/SignUp';
import QRPage from './Components/QRPage';
import VotingPage from './Components/VotingPage';
import ThankYou from './Components/ThankYou';
import OTPVerify from './Components/OTPVerify';
import VoteRedirect from './Components/VoteRedirect';
import VotersList from './Components/VotersList'; // Import the VotersList component
import AlreadyVotedPage from './Components/AlreadyVotedPage'; // Import AlreadyVotedPage component

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/qr" element={<QRPage />} />
        <Route path="/vote" element={<VotingPage />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/otp-verify" element={<OTPVerify/>}/>
        <Route path="/vote-redirect" element={<VoteRedirect />} />
        <Route path="/voters" element={<VotersList />} /> {/* Add the VotersList route */}
        <Route path="/already-voted" element={<AlreadyVotedPage />} /> {/* Add AlreadyVoted route */}
      </Routes>
    </Router>
  );
};

export default App;
