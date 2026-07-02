// src/components/VotersList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './VotersList.css';
import { BASE_URL } from '../config';
import { FiArrowLeft, FiUsers } from 'react-icons/fi';

const VotersList = () => {
  const [voters, setVoters] = useState([]);

  useEffect(() => {
    axios.get(`${BASE_URL}/get_voters`)
      .then(res => setVoters(res.data.votedList || []))
      .catch(err => console.error("Failed to fetch voters", err));
  }, []);

  // Helper parser to separate Name, Email, and Voter ID for neat table columns
  const parseVoter = (str) => {
    const regexWithId = /^(.*?)\s*\((.*?)\s*-\s*(.*?)\)$/;
    const regexWithoutId = /^(.*?)\s*\((.*?)\)$/;
    
    let match = str.match(regexWithId);
    if (match) {
      return { name: match[1], email: match[2], id: match[3] };
    }
    
    match = str.match(regexWithoutId);
    if (match) {
      return { name: match[1], email: match[2], id: 'N/A' };
    }
    
    return { name: str, email: 'N/A', id: 'N/A' };
  };

  return (
    <div className="voters-list-container">
      {/* Header bar */}
      <div className="voters-header">
        <div className="qr-header-title">
          <span>🗳️</span> E-Voting System
        </div>
        <div className="qr-header-nav">
          <Link to="/qr" className="nav-link">
            <FiArrowLeft style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Back to QR Page
          </Link>
        </div>
      </div>

      {/* Main card */}
      <div className="voters-card">
        <h2>
          <FiUsers style={{ color: 'var(--primary-color)' }} /> Voted List
        </h2>
        <p className="voters-subtitle">
          Real-time record of verified electors who have cast their vote.
        </p>

        <div className="voters-stat-badge">
          <span>Total Voters Cast:</span>
          <span className="stat-number">{voters.length}</span>
        </div>

        {voters.length > 0 ? (
          <table className="voters-table">
            <thead>
              <tr>
                <th>Voter Name</th>
                <th>Email Address</th>
                <th>Student/Voter ID</th>
              </tr>
            </thead>
            <tbody>
              {voters.map((item, index) => {
                const parsed = parseVoter(item);
                return (
                  <tr key={index}>
                    <td className="voter-name-cell">{parsed.name}</td>
                    <td className="voter-meta-cell">{parsed.email}</td>
                    <td className="voter-meta-cell">{parsed.id}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="empty-voters">No votes have been submitted yet.</p>
        )}
      </div>
    </div>
  );
};

export default VotersList;