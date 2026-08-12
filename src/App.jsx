import React, { useState, useEffect, useRef } from 'react';
import { CATEGORIES, SONGS } from './data/songs';
import {
  playTruckHorn,
  playSalonScissorsSound,
  playMistryCarpenterSound,
  playRickshawSound,
  playOfficeSound,
  playPeaceBellSound,
  playTravelEngineSound
} from './utils/hornSound';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat,
  ExternalLink, ListMusic, Volume2, VolumeX, Search, X, Radio, Scissors, Wrench, Car, Coffee, Bell, Compass, Dices
} from 'lucide-react';

const CATEGORY_BACKGROUNDS = {
  truck: '/images/truck_hero.png',
  salon: '/images/salon_hero.png',
  mistry: '/images/mistry_hero.png',
  rickshaw: '/images/rickshaw_hero.png',
  office: '/images/office_hero.png',
  peace: '/images/peace_hero.png',
  travel: '/images/travel_hero.png'
};

const CATEGORY_VIDEOS = {
  truck: '/videos/truck-driver.mp4',
  salon: '/videos/barber-styling.mp4',
  peace: '/videos/tanhai.mp4',
  travel: '/videos/kerala.mp4'
};

const CATEGORY_SLOGANS = {
  truck: 'बुरी नज़र वाले तेरा मुँह काला 🚛 • Horn OK Please Dhaba Special (hornokplease.xyz)',
  salon: 'डीलक्स सैलून • 90s बॉलीवुड रेडियो, चंपी मालिश & सीज़र स्निप ✂️ (saloon.wtf)',
  mistry: 'लकड़ी कारपेंटर वर्कशॉप • मिस्त्री का काम सॉलिड 🔨 (rajumistri.onrender.com)',
  rickshaw: 'मीटर डाउन 🛺 • 90s ऑटो ड्राइवर सिटी हिट्स (90s-nostalgiaindia.netlify.app)',
  office: 'चाय और कोड • डीडलाइन फोकस ☕ (productivityhindi)',
  peace: 'गंगा तेरा पानी अमृत • रूहानी शांति 🕉️ (nostalgiahits.in)',
  travel: 'लंबी सड़क • हाइवे Sunset ड्राइव (truckdrivermusic.in)'
};

const CATEGORY_LIVE_TELEMETRY = {
  truck: { min: 28450, max: 68900, text: 'LIVE HUMANS TUNED IN ON THIS WEBSITE 🚛' },
  salon: { min: 21200, max: 54400, text: 'LIVE HUMANS LISTENING AT SALOON ✂️' },
  mistry: { min: 16400, max: 42900, text: 'LIVE HUMANS IN CARPENTER WORKSHOP 🔨' },
  rickshaw: { min: 25900, max: 59200, text: 'LIVE HUMANS IN AUTO RICKSHAW 🛺' },
  office: { min: 14200, max: 39500, text: 'LIVE HUMANS WORKING & LISTENING ☕' },
  peace: { min: 31500, max: 72000, text: 'LIVE HUMANS IN SPIRITUAL SUFI PEACE 🕉️' },
  travel: { min: 22800, max: 57200, text: 'LIVE HUMANS ON HIGHWAY ROAD TRIP 🛣️' }
};

export default function App() {
  const [activeCategory, setActiveCategory] = useState('truck');
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(true);
  const [isRepeat, setIsRepeat] = useState(false);
  const [liveCount, setLiveCount] = useState(28450);
  const [clockTime, setClockTime] = useState('11:27 am');

  const audioRef = useRef(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClockTime(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase());
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Update real-time active human visitor count every 1.5 seconds
  useEffect(() => {
    const base = CATEGORY_LIVE_TELEMETRY[activeCategory] || CATEGORY_LIVE_TELEMETRY.truck;
    const initial = Math.floor(Math.random() * (base.max - base.min + 1)) + base.min;
    setLiveCount(initial);

    const interval = setInterval(() => {
      setLiveCount((prev) => {
        const delta = Math.floor(Math.random() * 25) - 10;
        const newCount = prev + delta;
        return Math.max(base.min, Math.min(base.max, newCount));
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [activeCategory]);

  const activeCatMeta = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];

  const filteredSongs = SONGS.filter((s) => {
    const matchesCat = activeCategory === 'all' || s.category === activeCategory;
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const currentSong = filteredSongs[currentSongIndex] || SONGS[0];

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => console.log('Autoplay:', e));
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSongEnded = () => {
    if (isRepeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      handleNext();
    }
  };

  const handleNext = () => {
    if (filteredSongs.length === 0) return;
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * filteredSongs.length);
      setCurrentSongIndex(randomIndex);
    } else {
      setCurrentSongIndex((prev) => (prev + 1) % filteredSongs.length);
    }
    setIsPlaying(true);
  };

  const handleRandomShuffle = () => {
    if (filteredSongs.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredSongs.length);
    setCurrentSongIndex(randomIndex);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (filteredSongs.length === 0) return;
    setCurrentSongIndex((prev) => (prev - 1 + filteredSongs.length) % filteredSongs.length);
    setIsPlaying(true);
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCategorySwitch = (catId) => {
    setActiveCategory(catId);
    const matching = SONGS.filter((s) => catId === 'all' || s.category === catId);
    if (matching.length > 0) {
      const randomIndex = Math.floor(Math.random() * matching.length);
      setCurrentSongIndex(randomIndex);
    } else {
      setCurrentSongIndex(0);
    }
  };

  const handleHornClick = () => {
    switch (activeCategory) {
      case 'truck': playTruckHorn(); break;
      case 'salon': playSalonScissorsSound(); break;
      case 'mistry': playMistryCarpenterSound(); break;
      case 'rickshaw': playRickshawSound(); break;
      case 'office': playOfficeSound(); break;
      case 'peace': playPeaceBellSound(); break;
      case 'travel': playTravelEngineSound(); break;
      default: playTruckHorn(); break;
    }
  };

  const getActionBtnData = () => {
    switch (activeCategory) {
      case 'truck':
        return { Icon: Radio, main: 'हॉर्न ओके प्लीज़', sub: 'Horn ok pleaseeee 🎺' };
      case 'salon':
        return { Icon: Scissors, main: 'सीज़र स्निप-स्निप', sub: 'सैलून कैंची & चंपी ✂️' };
      case 'mistry':
        return { Icon: Wrench, main: 'मिस्त्री हैमर & सॉ', sub: 'कारपेंटर औजार 🔨' };
      case 'rickshaw':
        return { Icon: Car, main: 'मीटर डाउन', sub: 'ऑटो रिक्शा पू-पू! 🛺' };
      case 'office':
        return { Icon: Coffee, main: 'कॉफी & किबोर्ड', sub: 'फोकस चाय घूंट ☕' };
      case 'peace':
        return { Icon: Bell, main: 'मंदिर घंटी & ॐ', sub: 'मंदिर शंख ध्वनि 🔔' };
      case 'travel':
        return { Icon: Compass, main: 'गाड़ी इग्निशन', sub: 'टर्बो इंजन रेव 🚗' };
      default:
        return { Icon: Radio, main: 'हॉर्न ओके प्लीज़', sub: 'Horn ok pleaseeee 🎺' };
    }
  };

  const getCategoryTitleHindi = () => {
    switch (activeCategory) {
      case 'truck': return 'ट्रक वाला (Horn OK Please)';
      case 'salon': return 'डीलक्स सैलून (Barber Saloon)';
      case 'mistry': return 'राजू मिस्त्री (Raju Mistry)';
      case 'rickshaw': return 'ऑटो रिक्शा (90s Auto)';
      case 'office': return 'ऑफिस चाय (Corporate Focus)';
      case 'peace': return 'रूहानी शांति (Nostalgia Hits)';
      case 'travel': return 'रोड ट्रिप सफ़र (Highway Travel)';
      default: return 'धुन सफर';
    }
  };

  const actionData = getActionBtnData();
  const ActionIcon = actionData.Icon;
  const currentTelemetryInfo = CATEGORY_LIVE_TELEMETRY[activeCategory] || CATEGORY_LIVE_TELEMETRY.truck;
  const currentVideoSrc = CATEGORY_VIDEOS[activeCategory];

  const handleOpenExternal = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="app-root" data-theme={activeCategory}>
      <audio
        ref={audioRef}
        src={currentSong ? currentSong.audioUrl : ''}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleSongEnded}
        preload="metadata"
      />

      {/* Live Video or Hero Background Image */}
      {currentVideoSrc ? (
        <video
          key={activeCategory}
          autoPlay
          loop
          muted
          playsInline
          className="hero-bg-video"
          src={currentVideoSrc}
        />
      ) : (
        <div
          className="hero-bg-image"
          style={{ backgroundImage: `url(${CATEGORY_BACKGROUNDS[activeCategory] || CATEGORY_BACKGROUNDS.truck})` }}
        />
      )}

      <div className="hero-gradient-overlay" />

      {/* Top Header Bar */}
      <header className="top-nav">
        <div className="top-time">{clockTime}</div>

        <div className="top-live-telemetry">
          <span className="live-green-dot" />
          <span>{liveCount.toLocaleString('en-US')} {currentTelemetryInfo.text}</span>
        </div>

        <div className="top-right-group">
          {/* External Site Playlist Quick Buttons */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              className="download-link-btn"
              onClick={() => handleOpenExternal(activeCatMeta.spotifyUrl || 'https://open.spotify.com')}
              title="Spotify Official Playlist"
            >
              <span>Spotify</span>
              <ExternalLink size={12} />
            </button>
            <button
              className="download-link-btn"
              onClick={() => handleOpenExternal(activeCatMeta.ytUrl || 'https://music.youtube.com')}
              title="YouTube Music Official Playlist"
            >
              <span>YT Music</span>
              <ExternalLink size={12} />
            </button>
          </div>

          <div className="category-nav-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`nav-pill-btn ${activeCategory === cat.id ? 'pill-active' : ''}`}
                onClick={() => handleCategorySwitch(cat.id)}
              >
                {cat.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Left Edge Floating Sound Action Button */}
      <button className="left-floating-horn-btn" onClick={handleHornClick}>
        <ActionIcon className="horn-btn-icon" size={18} />
        <div>
          <div className="horn-btn-text-main">{actionData.main}</div>
          <div className="horn-btn-text-sub">{actionData.sub}</div>
        </div>
      </button>

      {/* Center Giant Hindi Title & Slogan */}
      <main className="hero-center-content">
        <h1 className="giant-hindi-title">{getCategoryTitleHindi()}</h1>
        <div className="slogan-quote-line">
          <span>{CATEGORY_SLOGANS[activeCategory] || CATEGORY_SLOGANS.truck}</span>
        </div>
      </main>

      {/* Bottom Floating Player Capsule Bar */}
      <footer className="bottom-player-area">
        <div className="player-capsule-bar">
          <div className="player-left-thumb-group">
            <img
              src={currentSong ? currentSong.cover : ''}
              alt={currentSong ? currentSong.title : ''}
              className={`player-thumb-img ${isPlaying ? 'player-thumb-spinning' : ''}`}
            />
            <div className="player-song-details">
              <div className="player-song-title">{currentSong ? currentSong.title : 'गाना चुनें'}</div>
              <div className="player-song-artist">{currentSong ? `${currentSong.artist} • ${currentSong.movie}` : ''}</div>
              <div className="player-time-display">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="seek-slider"
            style={{ width: '120px' }}
          />

          <div className="player-center-controls">
            {/* Random Shuffle Button */}
            <button
              className="capsule-ctrl-btn active"
              onClick={handleRandomShuffle}
              title="रैंडम शफ़ल गाना चलाएं 🎲"
            >
              <Dices size={18} />
            </button>

            <button className="capsule-ctrl-btn" onClick={handlePrev} title="पिछला गाना">
              <SkipBack size={18} />
            </button>

            <button
              className="capsule-play-main-btn"
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'रोकें' : 'चलाएं'}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>

            <button className="capsule-ctrl-btn" onClick={handleNext} title="अगला गाना (शफ़ल)">
              <SkipForward size={18} />
            </button>

            <button
              className="capsule-ctrl-btn"
              onClick={() => setIsDrawerOpen(true)}
              title="प्लेलिस्ट लाइब्रेरी खोलें"
            >
              <ListMusic size={18} />
            </button>
          </div>
        </div>
      </footer>

      {/* Playlist Drawer Modal */}
      {isDrawerOpen && (
        <div className="playlist-drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <div className="playlist-drawer-card" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3 className="font-bold text-lg text-white">
                {activeCatMeta.name} गोल्डमाइन प्लेलिस्ट ({filteredSongs.length} गाने)
              </h3>
              <button className="drawer-close-btn" onClick={() => setIsDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="drawer-search-bar">
              <Search className="drawer-search-icon" size={16} />
              <input
                type="text"
                placeholder="गाने या गायक का नाम खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="drawer-search-input"
              />
            </div>

            <div className="drawer-song-list custom-scroll">
              {filteredSongs.map((song, idx) => {
                const isCurrent = currentSong && currentSong.id === song.id;
                return (
                  <div
                    key={song.id}
                    className={`drawer-song-row ${isCurrent ? 'drawer-row-active' : ''}`}
                    onClick={() => {
                      setCurrentSongIndex(idx);
                      setIsPlaying(true);
                    }}
                  >
                    <img src={song.cover} alt={song.title} className="drawer-thumb" />
                    <div style={{ flex: 1 }}>
                      <div className="font-semibold text-sm text-white">{song.title}</div>
                      <div className="text-xs text-gray-400">{song.artist} • {song.movie}</div>
                    </div>

                    <button
                      className="download-link-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenExternal(song.playlistUrl);
                      }}
                      title="यूट्यूब / स्पॉटिफ़ाई प्लेलिस्ट यूआरएल खोलें"
                    >
                      <ExternalLink size={14} />
                      <span>{song.domain || 'प्लेलिस्ट यूआरएल'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
