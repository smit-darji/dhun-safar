import React, { useState, useEffect } from 'react';
import { Radio, Users, MapPin, Zap } from 'lucide-react';

const LOCATIONS = [
  'NH-44 Near Ambala', 'Kanpur Toll Plaza', 'Ludhiana Dhaba',
  'Jaipur Highway', 'Surat Ring Road', 'Nagpur Bypass',
  'Bengaluru Outer Ring Road', 'Delhi-Mumbai Expressway'
];

const ACTIONS = [
  'is playing Waada Raha Sanam', 'sounded the Horn! 🎺', 'downloaded Tumsa Koi Pyaara',
  'switched to Mistry Power Beats', 'joined the Safar Sangeet stream'
];

const DRIVERS = [
  'Ramesh Singh', 'Gurpreet Paji', 'Mukesh Mechanic', 'Pappu Driver', 'Sanjay Kumar', 'Amit Sharma', 'Raju Garaage'
];

export function UserTelemetry({ activeTheme }) {
  const [onlineCount, setOnlineCount] = useState(1482);
  const [latestActivity, setLatestActivity] = useState({
    user: 'Gurpreet Paji',
    location: 'NH-44 Near Ambala',
    action: 'sounded the Horn! 🎺'
  });

  useEffect(() => {
    // Natural fluctuation interval
    const timer = setInterval(() => {
      const delta = Math.floor(Math.random() * 9) - 4; // -4 to +4
      setOnlineCount((prev) => Math.max(1200, prev + delta));

      // 30% chance to push a new activity ticker item
      if (Math.random() > 0.6) {
        const randUser = DRIVERS[Math.floor(Math.random() * DRIVERS.length)];
        const randLoc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
        const randAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
        setLatestActivity({ user: randUser, location: randLoc, action: randAction });
      }
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  const getVibeLabel = () => {
    switch (activeTheme) {
      case 'truck': return 'Drivers & Co-Drivers Cruising';
      case 'mistry': return 'Mechanics & Technicians Active';
      case 'office': return 'Workstation Listeners';
      case 'peace': return 'Soulful Listeners Live';
      case 'travel': return 'Roadtrippers on Highway';
      default: return 'Online Listeners';
    }
  };

  return (
    <div className="telemetry-bar shadow-md">
      <div className="telemetry-item live-pulse">
        <span className="pulse-dot"></span>
        <Radio className="icon-pulse" size={16} />
        <span className="font-bold text-amber-400">{onlineCount.toLocaleString()}</span>
        <span className="telemetry-label">{getVibeLabel()}</span>
      </div>

      <div className="telemetry-divider"></div>

      <div className="telemetry-ticker">
        <MapPin size={14} className="ticker-icon" />
        <span className="ticker-user">{latestActivity.user}</span>
        <span className="ticker-loc">({latestActivity.location})</span>
        <span className="ticker-action">{latestActivity.action}</span>
      </div>

      <div className="telemetry-status-badge">
        <Zap size={13} />
        <span>HD STEREO 320kbps</span>
      </div>
    </div>
  );
}
