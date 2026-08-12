import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Play, Pause, SkipBack, SkipForward,
  ExternalLink, ListMusic, Search, X, Radio, Scissors, Wrench, Car, Coffee, Bell, Compass, Dices,
  Sun, Moon, Users
} from 'lucide-react';

/* ─── static data ─────────────────────────────────────────── */
const CATEGORY_BACKGROUNDS = {
  truck:   '/images/truck_hero.png',
  salon:   '/images/salon_hero.png',
  mistry:  '/images/rajumistri_hero.png',
  rickshaw:'/images/rickshaw_hero.png',
  office:  '/images/office_hero.png',
  peace:   '/images/peace_hero.png',
  travel:  '/images/travel_hero.png',
};

const CATEGORY_SPOTIFY_PLAYLISTS = {
  truck:   '2AVjI8Z57bqMJVtU3V9X1Q',
  salon:   '37i9dQZF1DXdf576x3Zzla',
  mistry:  '37i9dQZF1DX8U7rREVwzsw',
  rickshaw:'2AVjI8Z57bqMJVtU3V9X1Q',
  office:  '37i9dQZF1DWWQRwui0EXPn',
  peace:   '37i9dQZF1DX65P15Lpldp7',
  travel:  '37i9dQZF1DX4Y4jU7CH5tX',
};

const CATEGORY_SLOGANS = {
  truck:   'बुरी नज़र वाले तेरा मुँह काला 🚛 • Horn OK Please Dhaba Special',
  salon:   'डीलक्स सैलून • 90s बॉलीवुड रेडियो, चंपी मालिश & सीज़र स्निप ✂️',
  mistry:  'मिस्त्री • मज़दूरों के संग देसी लेबर बीट्स 🏗️',
  rickshaw:'मीटर डाउन 🛺 • 90s ऑटो ड्राइवर सिटी हिट्स',
  office:  'चाय और कोड • डीडलाइन फोकस ☕',
  peace:   'गंगा तेरा पानी अमृत • रूहानी शांति 🕉️',
  travel:  'लंबी सड़क • हाइवे Sunset ड्राइव 🛣️',
};

const CATEGORY_META = {
  truck:   { emoji: '🚛', label: 'ट्रक' },
  salon:   { emoji: '✂️', label: 'सैलून' },
  mistry:  { emoji: '🏗️', label: 'मिस्त्री' },
  rickshaw:{ emoji: '🛺', label: 'रिक्शा' },
  office:  { emoji: '☕', label: 'ऑफिस' },
  peace:   { emoji: '🕉️', label: 'शांति' },
  travel:  { emoji: '🛣️', label: 'यात्रा' },
};

/* ─── unique user ID helpers ──────────────────────────────── */
function getOrCreateUID() {
  let uid = localStorage.getItem('dhun-safar-uid');
  if (!uid) {
    uid = 'u-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('dhun-safar-uid', uid);
  }
  return uid;
}

/* ─── component ───────────────────────────────────────────── */
export default function App() {
  const [activeCategory, setActiveCategory]   = useState('truck');
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying]             = useState(false);
  const [isDrawerOpen, setIsDrawerOpen]       = useState(false);
  const [searchQuery, setSearchQuery]         = useState('');
  const [currentTime, setCurrentTime]         = useState(0);
  const [duration, setDuration]               = useState(0);
  const [isShuffle, setIsShuffle]             = useState(true);
  const [playerMode, setPlayerMode]           = useState('library');
  const [clockTime, setClockTime]             = useState('');
  const [colorScheme, setColorScheme]         = useState(() =>
    localStorage.getItem('dhun-safar-theme') || 'dark'
  );
  const [activeTabCount, setActiveTabCount]   = useState(1); // real unique open tabs

  const audioRef    = useRef(null);
  const myUID       = useRef(getOrCreateUID());
  const channelRef  = useRef(null);
  const peersRef    = useRef(new Set()); // track known peers

  /* ── clock ── */
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClockTime(now.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);

  /* ── persist theme ── */
  useEffect(() => {
    localStorage.setItem('dhun-safar-theme', colorScheme);
  }, [colorScheme]);

  /* ── real unique-tab live count via BroadcastChannel ── */
  useEffect(() => {
    const CHANNEL = 'dhun-safar-live';
    const uid = myUID.current;

    // Announce presence + ask others to reply
    const announce = (type) => {
      try { channelRef.current?.postMessage({ type, uid }); } catch (_) {}
    };

    const bc = new BroadcastChannel(CHANNEL);
    channelRef.current = bc;
    peersRef.current = new Set();

    bc.onmessage = (e) => {
      const { type, uid: fromUID } = e.data || {};
      if (!fromUID || fromUID === uid) return;

      if (type === 'hello' || type === 'ping') {
        // someone new joined or pinged — add and reply
        peersRef.current.add(fromUID);
        setActiveTabCount(peersRef.current.size + 1); // +1 = me
        announce('pong');
      } else if (type === 'pong') {
        peersRef.current.add(fromUID);
        setActiveTabCount(peersRef.current.size + 1);
      } else if (type === 'bye') {
        peersRef.current.delete(fromUID);
        setActiveTabCount(peersRef.current.size + 1);
      }
    };

    // Announce myself
    announce('hello');

    // Periodic ping to discover peers & prune stale ones
    const pingId = setInterval(() => {
      announce('ping');
    }, 8_000);

    // On page hide/unload, tell others we're gone
    const handleHide = () => announce('bye');
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') announce('bye');
      else announce('hello');
    });
    window.addEventListener('pagehide', handleHide);
    window.addEventListener('beforeunload', handleHide);

    return () => {
      announce('bye');
      clearInterval(pingId);
      bc.close();
      window.removeEventListener('pagehide', handleHide);
      window.removeEventListener('beforeunload', handleHide);
    };
  }, []);

  /* ── category / song logic ── */
  const filteredSongs = SONGS.filter((s) => {
    const matchesCat    = activeCategory === 'all' || s.category === activeCategory;
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const currentSong = filteredSongs[currentSongIndex] || SONGS[0];
  const activeCatMeta = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];

  /* ── audio playback ── */
  useEffect(() => {
    if (!audioRef.current) return;
    if (playerMode === 'library' && isPlaying) {
      audioRef.current.play().catch((e) => console.log('Autoplay:', e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong, playerMode]);

  const handleTimeUpdate  = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };
  const handleSeek = (e) => {
    const t = parseFloat(e.target.value);
    if (audioRef.current) { audioRef.current.currentTime = t; setCurrentTime(t); }
  };
  const handleSongEnded = () => handleNext();

  const handleNext = useCallback(() => {
    if (!filteredSongs.length) return;
    setCurrentSongIndex(isShuffle
      ? Math.floor(Math.random() * filteredSongs.length)
      : (prev) => (prev + 1) % filteredSongs.length
    );
    setIsPlaying(true);
  }, [filteredSongs, isShuffle]);

  const handlePrev = () => {
    if (!filteredSongs.length) return;
    setCurrentSongIndex((prev) => (prev - 1 + filteredSongs.length) % filteredSongs.length);
    setIsPlaying(true);
  };

  const handleRandomShuffle = () => {
    if (!filteredSongs.length) return;
    setCurrentSongIndex(Math.floor(Math.random() * filteredSongs.length));
    setIsPlaying(true);
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    return `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, '0')}`;
  };

  const handleCategorySwitch = (catId) => {
    setActiveCategory(catId);
    const matching = SONGS.filter((s) => catId === 'all' || s.category === catId);
    setCurrentSongIndex(matching.length > 0 ? Math.floor(Math.random() * matching.length) : 0);
  };

  /* ── sound FX ── */
  const handleHornClick = () => {
    const map = { truck: playTruckHorn, salon: playSalonScissorsSound, mistry: playMistryCarpenterSound,
                  rickshaw: playRickshawSound, office: playOfficeSound, peace: playPeaceBellSound, travel: playTravelEngineSound };
    (map[activeCategory] || playTruckHorn)();
  };

  const getActionBtnData = () => {
    const map = {
      truck:   { Icon: Radio,   main: 'हॉर्न ओके प्लीज़', sub: 'Horn OK please 🎺' },
      salon:   { Icon: Scissors,main: 'सीज़र स्निप-स्निप', sub: 'सैलून कैंची & चंपी ✂️' },
      mistry:  { Icon: Wrench,  main: 'मिस्त्री औजार', sub: 'मज़दूर बीट्स 🏗️' },
      rickshaw:{ Icon: Car,     main: 'मीटर डाउन', sub: 'ऑटो रिक्शा पू-पू 🛺' },
      office:  { Icon: Coffee,  main: 'कॉफी & किबोर्ड', sub: 'फोकस चाय ☕' },
      peace:   { Icon: Bell,    main: 'मंदिर घंटी & ॐ', sub: 'शंख ध्वनि 🔔' },
      travel:  { Icon: Compass, main: 'गाड़ी इग्निशन', sub: 'इंजन रेव 🚗' },
    };
    return map[activeCategory] || map.truck;
  };

  const getCategoryTitle = () => {
    const map = { truck:'ट्रक ड्राइवर', mistry:'मिस्त्री', salon:'डीलक्स सैलून',
                  rickshaw:'ऑटो रिक्शा', office:'ऑफिस चाय', peace:'रूहानी यादें', travel:'रोड ट्रिप सफ़र' };
    return map[activeCategory] || 'ट्रक ड्राइवर';
  };

  const actionData = getActionBtnData();
  const ActionIcon = actionData.Icon;
  const isDark = colorScheme === 'dark';

  const openExternal = (url) => window.open(url, '_blank', 'noopener,noreferrer');

  /* ── render ── */
  return (
    <div className="app-root" data-theme={activeCategory} data-color-scheme={colorScheme}>
      <audio
        ref={audioRef}
        src={currentSong?.audioUrl || ''}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleSongEnded}
        preload="metadata"
      />

      {/* ── Background ── */}
      <div
        key={activeCategory}
        className="hero-bg-image"
        style={{ backgroundImage: `url(${CATEGORY_BACKGROUNDS[activeCategory] || CATEGORY_BACKGROUNDS.truck})` }}
      />
      <div className="hero-gradient-overlay" />

      {/* ══════════════════════════════════════════════════════
          TOP NAV
      ══════════════════════════════════════════════════════ */}
      <header className="top-nav">

        {/* Clock */}
        <div className="top-time">
          {isDark ? '🌙' : '☀️'} {clockTime}
        </div>

        {/* Live unique user count */}
        <div className="top-live-telemetry">
          <span className="live-green-dot" />
          <Users size={15} style={{ flexShrink: 0 }} />
          <span className="live-count-num">{activeTabCount}</span>
          <span className="live-count-label">लाइव यूज़र</span>
        </div>

        {/* Right group */}
        <div className="top-right-group">

          {/* Playlist quick link */}
          <button
            className="download-link-btn"
            onClick={() => openExternal(activeCatMeta.spotifyUrl || 'https://open.spotify.com/playlist/2AVjI8Z57bqMJVtU3V9X1Q')}
            title="ऑफ़िशियल प्लेलिस्ट"
          >
            <span>प्लेलिस्ट 🎵</span>
            <ExternalLink size={13} />
          </button>

          {/* Dark / Light toggle */}
          <button
            className="theme-toggle-btn"
            onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
            title={isDark ? 'दिन थीम' : 'रात थीम'}
            aria-label="theme toggle"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Category pills */}
          <nav className="category-nav-pills" aria-label="श्रेणी चुनें">
            {CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat.id] || {};
              return (
                <button
                  key={cat.id}
                  className={`nav-pill-btn ${activeCategory === cat.id ? 'pill-active' : ''}`}
                  onClick={() => handleCategorySwitch(cat.id)}
                  title={cat.name}
                >
                  <span className="pill-emoji">{meta.emoji}</span>
                  <span className="pill-label">{meta.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════
          LEFT SOUND BUTTON
      ══════════════════════════════════════════════════════ */}
      <button className="left-floating-horn-btn" onClick={handleHornClick}>
        <ActionIcon className="horn-btn-icon" size={22} />
        <div>
          <div className="horn-btn-text-main">{actionData.main}</div>
          <div className="horn-btn-text-sub">{actionData.sub}</div>
        </div>
      </button>

      {/* ══════════════════════════════════════════════════════
          CENTER HERO
      ══════════════════════════════════════════════════════ */}
      <main className="hero-center-content">
        <h1 className="giant-hindi-title">{getCategoryTitle()}</h1>
        <div className="slogan-quote-line">
          <span>{CATEGORY_SLOGANS[activeCategory] || CATEGORY_SLOGANS.truck}</span>
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════
          BOTTOM PLAYER
      ══════════════════════════════════════════════════════ */}
      <footer className="bottom-player-area">
        {playerMode === 'spotify' ? (
          <div className="player-capsule-bar" style={{ padding: '0.5rem', gap: '0.75rem', borderRadius: '18px' }}>
            <div style={{ flex: 1 }}>
              <iframe
                src={`https://open.spotify.com/embed/playlist/${CATEGORY_SPOTIFY_PLAYLISTS[activeCategory] || '2AVjI8Z57bqMJVtU3V9X1Q'}?utm_source=generator&theme=0`}
                width="100%" height="88"
                frameBorder="0" allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy" style={{ border: 'none', borderRadius: '12px' }}
              />
            </div>
            <button
              className="capsule-ctrl-btn"
              onClick={() => { setPlayerMode('library'); setIsPlaying(true); }}
              title="लाइब्रेरी प्लेयर"
              style={{ background: 'rgba(255,255,255,0.1)', height: '44px', width: '44px', borderRadius: '50%' }}
            >
              <ListMusic size={20} />
            </button>
          </div>
        ) : (
          <div className="player-capsule-bar">
            {/* Artwork + info */}
            <div className="player-left-thumb-group">
              <img
                src={currentSong?.cover || ''}
                alt={currentSong?.title || ''}
                className={`player-thumb-img ${isPlaying ? 'player-thumb-spinning' : ''}`}
              />
              <div className="player-song-details">
                <div className="player-song-title">{currentSong?.title || 'गाना चुनें'}</div>
                <div className="player-song-artist">{currentSong ? `${currentSong.artist} • ${currentSong.movie}` : ''}</div>
                <div className="player-time-display">{formatTime(currentTime)} / {formatTime(duration)}</div>
              </div>
            </div>

            {/* Seek */}
            <input
              type="range" min="0" max={duration || 100} value={currentTime}
              onChange={handleSeek} className="seek-slider" style={{ width: '130px' }}
            />

            {/* Controls */}
            <div className="player-center-controls">
              <button className={`capsule-ctrl-btn ${isShuffle ? 'active' : ''}`} onClick={handleRandomShuffle} title="रैंडम शफ़ल 🎲">
                <Dices size={20} />
              </button>
              <button className="capsule-ctrl-btn" onClick={handlePrev} title="पिछला गाना">
                <SkipBack size={20} />
              </button>
              <button className="capsule-play-main-btn" onClick={() => setIsPlaying(!isPlaying)} title={isPlaying ? 'रोकें' : 'चलाएं'}>
                {isPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: '2px' }} />}
              </button>
              <button className="capsule-ctrl-btn" onClick={handleNext} title="अगला गाना">
                <SkipForward size={20} />
              </button>
              <button className="capsule-ctrl-btn" onClick={() => { setIsPlaying(false); setPlayerMode('spotify'); }} title="स्पॉटिफ़ाई">
                <Radio size={20} />
              </button>
              <button className="capsule-ctrl-btn" onClick={() => setIsDrawerOpen(true)} title="प्लेलिस्ट खोलें">
                <ListMusic size={20} />
              </button>
            </div>
          </div>
        )}
      </footer>

      {/* ══════════════════════════════════════════════════════
          PLAYLIST DRAWER
      ══════════════════════════════════════════════════════ */}
      {isDrawerOpen && (
        <div className="playlist-drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <div className="playlist-drawer-card" onClick={(e) => e.stopPropagation()}>

            <div className="drawer-header">
              <h3>{activeCatMeta.name} गोल्डमाइन प्लेलिस्ट</h3>
              <button className="drawer-close-btn" onClick={() => setIsDrawerOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <div className="drawer-search-bar">
              <Search className="drawer-search-icon" size={17} />
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
                    onClick={() => { setCurrentSongIndex(idx); setPlayerMode('library'); setIsPlaying(true); }}
                  >
                    <img src={song.cover} alt={song.title} className="drawer-thumb" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="drawer-song-title">{song.title}</div>
                      <div className="drawer-song-sub">{song.artist} • {song.movie}</div>
                    </div>
                    <button
                      className="download-link-btn"
                      onClick={(e) => { e.stopPropagation(); openExternal(song.playlistUrl); }}
                      title="सुनें"
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
