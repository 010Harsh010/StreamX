import React from "react";
import "../CSS/updatepage.css";

const Updatepage = () => {
  return (
    <div className="bodycontainer">
      <div className="sidebar">
        <div className="logo">Play</div>
        <ul className="menu">
          <li>Home</li>
          <li>Liked Videos</li>
          <li>History</li>
          <li>My Content</li>
          <li>Collection</li>
          <li>Subscribers</li>
        </ul>
        <div className="settings">
          <button>Support</button>
          <button>Settings</button>
        </div>
      </div>

      <div className="main">
        <div className="header">
          <div className="coverimage">
            <img src="/gradient-bg.jpg" alt="Cover" />
          </div>
          <div className="profile">
            <div className="profile-pic">
              <img src="/me.jpg" alt="Profile" />
            </div>
            <div className="profile-info">
              <h1>HARSH SINGH</h1>
              <p>@HarshSingh</p>
              <p>600 Subscribers • 100 Subscribed</p>
            </div>
            <button className="follow-btn">Follow</button>
          </div>
        </div>

        <div className="tabs">
          <button>Videos</button>
          <button>Playlist</button>
          <button className="active">Tweets</button>
          <button>Following</button>
        </div>

        <div className="content">
          <div className="post">
            <div className="post-header">
              <img src="/me.jpg" alt="User" />
              <div className="post-info">
                <p>Jacob Smith • Just now</p>
                <p>Great video, waiting for more awesome videos like these.</p>
              </div>
            </div>
            <div className="post-stats">
              <span>👍 18.23K</span>
              <span>👎 82.48K</span>
            </div>
          </div>
          {/* Add more posts here */}
        </div>
      </div>
    </div>
  );
};

export default Updatepage;
