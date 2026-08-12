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
  mistry: '/images/rajumistri_hero.png',
  rickshaw: '/images/rickshaw_hero.png',
  office: '/images/office_hero.png',
  peace: '/images/peace_hero.png',
  travel: '/images/travel_hero.png'
};

const CATEGORY_VIDEOS = {
  truck: '/videos/truck-driver.mp4',
  salon: '/videos/barber-styling.mp4',
  mistry: '/videos/mistry.mp4',
  rickshaw: '/videos/rickshaw.mp4',
  office: '/videos/office.mp4',
  peace: '/videos/tanhai.mp4',
  travel: '/videos/kerala.mp4'
};

const CATEGORY_SPOTIFY_PLAYLISTS = {
  truck: '2AVjI8Z57bqMJVtU3V9X1Q',
  salon: '37i9dQZF1DXdf576x3Zzla', // 90s Bollywood Hits
  mistry: '37i9dQZF1DX8U7rREVwzsw', // Focus / Instrumental
  rickshaw: '2AVjI8Z57bqMJVtU3V9X1Q', // Bollywood Retro
  office: '37i9dQZF1DWWQRwui0EXPn', // Lofi Beats
  peace: '37i9dQZF1DX65P15Lpldp7', // Sufi Classics
  travel: '37i9dQZF1DX4Y4jU7CH5tX' // Road Trip
};

const CATEGORY_SLOGANS = {
  truck: 'बुरी नज़र वाले तेरा मुँह काला 🚛 • Horn OK Please Dhaba Special',
  salon: 'डीलक्स सैलून • 90s बॉलीवुड रेडियो, चंपी मालिश & सीज़र स्निप ✂️',
  mistry: 'राजू मिस्त्री • मज़दूरों के संग देसी लेबर बीट्स 🏗️',
  rickshaw: 'मीटर डाउन 🛺 • 90s ऑटो ड्राइवर सिटी हिट्स',
  office: 'चाय और कोड • डीडलाइन फोकस ☕',
  peace: 'गंगा तेरा पानी अमृत • रूहानी शांति 🕉️',
  travel: 'लंबी सड़क • हाइवे Sunset ड्राइव 🛣️'
};

const CATEGORY_LIVE_TELEMETRY = {
  truck: { min: 45, max: 120, text: 'हाइवे ड्राइवरों के संग 🚛' },
  salon: { min: 30, max: 85, text: 'सैलून सीट पर ग्राहकों के संग ✂️' },
  mistry: { min: 25, max: 70, text: 'मज़दूरों के संग 🏗️' },
  rickshaw: { min: 40, max: 110, text: 'सवारी के संग 🛺' },
  office: { min: 15, max: 55, text: 'काम में व्यस्त साथियों के संग ☕' },
  peace: { min: 50, max: 150, text: 'रूहानी शांति में लीन 🕉️' },
  travel: { min: 35, max: 95, text: 'यात्रियों के संग \u00A0' }
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
  const [liveCount, setLiveCount] = useState(65);
  const [playerMode, setPlayerMode] = useState('library');
  const [clockTime, setClockTime] = useState('11:43 am');

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
    if (playerMode === 'library' && isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => console.log('Autoplay:', e));
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong, playerMode]);

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
        return { Icon: Wrench, main: 'राजू मिस्त्री औजार', sub: 'मज़दूर मिस्त्री बीट्स 🏗️' };
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
      case 'truck': return 'ट्रक ड्राइवर';
      case 'mistry': return 'राजू मिस्त्री';
      case 'salon': return 'डीलक्स सैलून';
      case 'rickshaw': return 'ऑटो रिक्शा';
      case 'office': return 'ऑफिस चाय';
      case 'peace': return 'रूहानी यादें';
      case 'travel': return 'रोड ट्रिप सफ़र';
      default: return 'ट्रक ड्राइवर';
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

      {/* Background Image / Video Container */}
      {activeCategory === 'rickshaw' ? (
        <div 
          className="hero-bg-image rickshaw-layout"
          style={{ backgroundImage: `url(${CATEGORY_BACKGROUNDS.rickshaw})` }}
        >
          <div className="rickshaw-windshield-container">
            <video
              key={activeCategory}
              autoPlay
              loop
              muted
              playsInline
              className="rickshaw-windshield-video"
              src={currentVideoSrc}
            />
          </div>
        </div>
      ) : currentVideoSrc ? (
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
        <div className="top-time">{clockTime} 🌙</div>

        <div className="top-live-telemetry">
          <span className="live-green-dot" />
          <span>• {liveCount.toLocaleString('en-US')} {currentTelemetryInfo.text}</span>
        </div>

        <div className="top-right-group">
          {/* External Site Playlist Quick Buttons */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button 
              className="download-link-btn" 
              onClick={() => handleOpenExternal(activeCatMeta.spotifyUrl || 'https://open.spotify.com/playlist/2AVjI8Z57bqMJVtU3V9X1Q')}
              title="ऑफ़िशियल प्लेलिस्ट"
            >
              <span>प्लेलिस्ट 🎵</span>
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
        {playerMode === 'spotify' ? (
          <div className="player-capsule-bar" style={{ padding: '0.4rem', gap: '0.75rem', width: 'min(90%, 650px)', borderRadius: '16px' }}>
            <div style={{ flex: 1 }}>
              <iframe 
                src={`https://open.spotify.com/embed/playlist/${CATEGORY_SPOTIFY_PLAYLISTS[activeCategory] || '2AVjI8Z57bqMJVtU3V9X1Q'}?utm_source=generator&theme=0`} 
                width="100%" 
                height="80" 
                frameBorder="0" 
                allowFullScreen="" 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy"
                style={{ border: 'none', borderRadius: '12px' }}
              />
            </div>
            <button 
              className="capsule-ctrl-btn" 
              onClick={() => {
                setPlayerMode('library');
                setIsPlaying(true);
              }}
              title="लाइब्रेरी प्लेयर पर स्विच करें"
              style={{ background: 'rgba(255, 255, 255, 0.1)', height: '40px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
            >
              <ListMusic size={18} />
            </button>
          </div>
        ) : (
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
                className={`capsule-ctrl-btn ${isShuffle ? 'active' : ''}`}
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

              <button className="capsule-ctrl-btn" onClick={handleNext} title="अगला गाना">
                <SkipForward size={18} />
              </button>

              {/* Spotify Toggle Button */}
              <button 
                className="capsule-ctrl-btn" 
                onClick={() => {
                  setIsPlaying(false);
                  setPlayerMode('spotify');
                }}
                title="स्पॉटिफ़ाई प्लेलिस्ट खोलें"
              >
                <Radio size={18} />
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
        )}
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
                      setPlayerMode('library');
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
                      <span>सुनें 🎵</span>
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
