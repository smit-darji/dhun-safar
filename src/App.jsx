import React, { useState, useEffect, useRef } from 'react';
import { CATEGORIES, SONGS } from './data/songs';
import { 
  playTruckHorn, 
  playSalonScissorsSound,
  playMistryCarpenterSound, 
  playOfficeSound, 
  playPeaceBellSound, 
  playTravelEngineSound 
} from './utils/hornSound';
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, 
  Download, ListMusic, Volume2, VolumeX, Search, X, Radio, Scissors, Wrench, Coffee, Bell, Compass, Dices
} from 'lucide-react';

const CATEGORY_BACKGROUNDS = {
  truck: '/images/truck_hero.png',
  salon: '/images/salon_hero.png',
  mistry: '/images/mistry_hero.png',
  office: '/images/office_hero.png',
  peace: '/images/peace_hero.png',
  travel: '/images/travel_hero.png'
};

const CATEGORY_SLOGANS = {
  truck: 'बुरी नज़र वाले तेरा मुँह काला 🚛 • Horn OK Please Dhaba Special',
  salon: 'डीलक्स सैलून • 90s बॉलीवुड रेडियो, चंपी मालिश & सीज़र स्निप ✂️',
  mistry: 'लकड़ी कारपेंटर वर्कशॉप • मिस्त्री का काम सॉलिड 🔨',
  office: 'चाय और कोड • डीडलाइन फोकस ☕',
  peace: 'गंगा तेरा पानी अमृत • रूहानी शांति 🕉️',
  travel: 'लंबी सड़क • हाइवे Sunset ड्राइव 🛣️'
};

const CATEGORY_LIVE_TELEMETRY = {
  truck: { min: 14850, max: 48900, text: 'on the highway 🚛' },
  salon: { min: 11200, max: 36400, text: 'लाइव ग्राहक डीलक्स सैलून सीट पर ✂️' },
  mistry: { min: 9400, max: 28900, text: 'लाइव कारपेंटर मिस्त्री वर्कशॉप में 🔨' },
  office: { min: 8200, max: 24500, text: 'लाइव ऑफिस वर्कर काम में व्यस्त ☕' },
  peace: { min: 16500, max: 52000, text: 'लाइव रूहानी शांति में लीन 🕉️' },
  travel: { min: 12800, max: 41200, text: 'लाइव यात्री रोड ट्रिप सफ़र पर 🛣️' }
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
  const [liveCount, setLiveCount] = useState(14850);
  const [clockTime, setClockTime] = useState('7:28 pm');

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

  // Update live listener count dynamically every 2 seconds based on active category
  useEffect(() => {
    const base = CATEGORY_LIVE_TELEMETRY[activeCategory] || CATEGORY_LIVE_TELEMETRY.truck;
    const initial = Math.floor(Math.random() * (base.max - base.min + 1)) + base.min;
    setLiveCount(initial);

    const interval = setInterval(() => {
      setLiveCount((prev) => {
        const delta = Math.floor(Math.random() * 45) - 20;
        const newCount = prev + delta;
        return Math.max(base.min, Math.min(base.max, newCount));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [activeCategory]);

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
      case 'truck': return 'ट्रक वाला';
      case 'salon': return 'डीलक्स सैलून';
      case 'mistry': return 'कारपेंटर मिस्त्री';
      case 'office': return 'ऑफिस';
      case 'peace': return 'रूहानी शांति';
      case 'travel': return 'रोड ट्रिप सफ़र';
      default: return 'धुन सफर';
    }
  };

  const actionData = getActionBtnData();
  const ActionIcon = actionData.Icon;
  const currentTelemetryInfo = CATEGORY_LIVE_TELEMETRY[activeCategory] || CATEGORY_LIVE_TELEMETRY.truck;

  const handleDownload = (e, song) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = song.audioUrl;
    link.download = `${song.title} - ${song.artist}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      {/* Hero Background Image */}
      <div 
        className="hero-bg-image" 
        style={{ backgroundImage: `url(${CATEGORY_BACKGROUNDS[activeCategory] || CATEGORY_BACKGROUNDS.truck})` }}
      />
      <div className="hero-gradient-overlay" />

      {/* Top Header Bar */}
      <header className="top-nav">
        <div className="top-time">{clockTime}</div>

        <div className="top-live-telemetry">
          <span className="live-green-dot" />
          <span>{liveCount.toLocaleString('en-US')} {currentTelemetryInfo.text}</span>
        </div>

        <div className="top-right-group">
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
              <h3 className="font-bold text-lg text-white">धुन सफर प्लेलिस्ट लाइब्रेरी ({filteredSongs.length} गाने)</h3>
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
                    <div>
                      <div className="font-semibold text-sm text-white">{song.title}</div>
                      <div className="text-xs text-gray-400">{song.artist} • {song.movie}</div>
                    </div>

                    <button 
                      className="download-link-btn" 
                      onClick={(e) => handleDownload(e, song)}
                      title="डाउनलोड करें"
                    >
                      <Download size={14} />
                      <span>डाउनलोड</span>
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
