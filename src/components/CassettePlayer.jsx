import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Shuffle, Repeat, Download
} from 'lucide-react';
import { playTruckHorn } from '../utils/hornSound';

export function CassettePlayer({ 
  currentSong, 
  isPlaying, 
  onTogglePlay, 
  onNext, 
  onPrev, 
  activeTheme 
}) {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [hornAnimation, setHornAnimation] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => console.log('Audio playback error:', error));
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

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
      onNext(isShuffle);
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleHornClick = () => {
    setHornAnimation(true);
    playTruckHorn();
    setTimeout(() => setHornAnimation(false), 900);
  };

  const handleDownloadCurrent = () => {
    if (!currentSong) return;
    const link = document.createElement('a');
    link.href = currentSong.audioUrl;
    link.download = `${currentSong.title} - ${currentSong.artist}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getVibeSubtitle = () => {
    switch (activeTheme) {
      case 'truck': return 'ट्रक वाला — बुरी नज़र वाले तेरा मुँह काला';
      case 'mistry': return 'मिस्त्री — भारी सर्विस वर्कशॉप हिट्स';
      case 'office': return 'ऑफिस — चाय और कोड लोज़ी बीट्स';
      case 'peace': return 'शांति — सूफी और गजल रूहानी धुन';
      case 'travel': return 'सफ़र — लंबी सड़क हाइवे ड्राइव';
      default: return 'धुन सफर ओरिजिनल कैसेट';
    }
  };

  return (
    <div className={`cassette-deck-card ${activeTheme}-deck`}>
      <audio
        ref={audioRef}
        src={currentSong ? currentSong.audioUrl : ''}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleSongEnded}
        preload="metadata"
      />

      {/* Deck Header Bar */}
      <div className="deck-header">
        <div className="brand-text font-mono">DHUN SAFAR STEREO CASSETTE</div>
        <div className="tape-side font-mono">SIDE-A</div>
        <div className="vibe-indicator">{getVibeSubtitle()}</div>
      </div>

      {/* 90s Vintage Cassette Visual */}
      <div className="cassette-body">
        <div className="cassette-label-plate">
          <div className="screw screw-tl"></div>
          <div className="screw screw-tr"></div>
          <div className="screw screw-bl"></div>
          <div className="screw screw-br"></div>

          {/* Authentic 90s Cassette Brand Strip */}
          <div className="vintage-cassette-header">
            <span className="cassette-tseries-logo">SUPER CASSETTES • DHUN SAFAR</span>
            <span className="cassette-capacity">C-90 HIGH BIAS</span>
          </div>

          {/* Scribbled Track Title Line */}
          <div className="handwritten-title-box">
            <span className="handwritten-label">गाना / SONG:</span>
            <span className="handwritten-text truncate">
              {currentSong ? `${currentSong.title} (${currentSong.movie || 'Classic'})` : 'कोई कैसेट नहीं चुनी'}
            </span>
            <span className="handwritten-artist truncate">
              {currentSong ? `गायक: ${currentSong.artist}` : 'कैसेट लोड करें'}
            </span>
          </div>

          {/* Cassette Window & Reels */}
          <div className="cassette-window">
            <div className={`cassette-reel ${isPlaying ? 'reels-spinning' : ''}`}>
              <div className="reel-center"></div>
              <div className="reel-teeth"></div>
            </div>

            <div className="tape-bridge">
              <div className="tape-ribbon"></div>
            </div>

            <div className={`cassette-reel ${isPlaying ? 'reels-spinning' : ''}`}>
              <div className="reel-center"></div>
              <div className="reel-teeth"></div>
            </div>
          </div>
        </div>

        {/* Truck Horn Button (For Truck Wala Theme) */}
        {activeTheme === 'truck' && (
          <button 
            className={`horn-btn ${hornAnimation ? 'horn-active' : ''}`}
            onClick={handleHornClick}
          >
            <span className="horn-text-hi">हॉर्न ओके प्लीज़ 🎺</span>
          </button>
        )}
      </div>

      {/* VFD Digital Time Segment Display */}
      <div className="vfd-display font-mono">
        <span>{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="seek-slider"
        />
        <span>{formatTime(duration)}</span>
      </div>

      {/* Retro Deck Physical Controls */}
      <div className="deck-controls">
        <div className="primary-controls">
          <button className="ctrl-btn" onClick={() => onPrev()} title="Previous Track">
            <SkipBack size={18} />
          </button>

          <button 
            className="ctrl-btn play-main-btn" 
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>

          <button className="ctrl-btn" onClick={() => onNext(isShuffle)} title="Next Track">
            <SkipForward size={18} />
          </button>

          <button 
            className={`ctrl-btn ${isShuffle ? 'active' : ''}`}
            onClick={() => setIsShuffle(!isShuffle)}
            title="Shuffle"
          >
            <Shuffle size={16} />
          </button>

          <button 
            className={`ctrl-btn ${isRepeat ? 'active' : ''}`}
            onClick={() => setIsRepeat(!isRepeat)}
            title="Repeat"
          >
            <Repeat size={16} />
          </button>
        </div>

        <div className="volume-download-group">
          <button className="download-current-btn" onClick={handleDownloadCurrent}>
            <Download size={14} />
            <span>MP3</span>
          </button>

          <div className="flex items-center gap-1">
            <button onClick={() => setIsMuted(!isMuted)} className="vol-icon">
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="vol-slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
