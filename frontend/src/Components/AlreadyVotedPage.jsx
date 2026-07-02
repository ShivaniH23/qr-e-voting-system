import React from 'react';
import './AlreadyVotedPage.css';
import { FiAlertTriangle } from 'react-icons/fi';

const AlreadyVotedPage = () => {
  return (
    <div className="voted-container">
      <div className="voted-card">
        <div className="voted-icon-wrapper">
          <FiAlertTriangle />
        </div>
        <h1>Vote Already Cast</h1>
        <p>
          Our database indicates that this Voter ID has already cast a ballot. 
          To ensure democratic fairness, each voter is allowed to vote only once.
        </p>
      </div>
    </div>
  );
};

export default AlreadyVotedPage;
