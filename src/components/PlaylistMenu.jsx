import React from 'react';
import { Search, Play, Pause, Download, ExternalLink, Music, Disc } from 'lucide-react';

export function PlaylistMenu({ 
  songs, 
  currentSong, 
  isPlaying, 
  onSelectSong, 
  searchQuery, 
  setSearchQuery,
  activeCategory,
  onCategorySelect,
  categories
}) {
  const filteredSongs = songs.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.movie.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (e, song) => {
    e.stopPropagation();
    // Trigger download anchor
    const link = document.createElement('a');
    link.href = song.audioUrl;
    link.download = `${song.title} - ${song.artist}.mp3`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="playlist-container glass-card">
      <div className="playlist-header">
        <div className="flex items-center gap-2">
          <Disc className="animate-spin-slow text-amber-400" size={22} />
          <h3 className="font-bold text-lg text-white">Cassette Library & Search</h3>
        </div>
        <span className="count-badge">{filteredSongs.length} Tracks Available</span>
      </div>

      {/* Category Pills Filter */}
      <div className="category-pills">
        <button 
          className={`pill-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => onCategorySelect('all')}
        >
          All (सब)
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`pill-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => onCategorySelect(cat.id)}
          >
            {cat.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Search Input Bar */}
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search song name, singer, movie (e.g. Waada Raha, Kumar Sanu)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button className="clear-search" onClick={() => setSearchQuery('')}>✕</button>
        )}
      </div>

      {/* Song List */}
      <div className="song-list custom-scroll">
        {filteredSongs.length === 0 ? (
          <div className="empty-search">
            <Music size={32} className="opacity-40 mb-2" />
            <p>No songs found for "{searchQuery}"</p>
            <span className="text-xs opacity-60">Try searching another 90s hit or select "All"</span>
          </div>
        ) : (
          filteredSongs.map((song, index) => {
            const isCurrent = currentSong && currentSong.id === song.id;
            return (
              <div
                key={song.id}
                className={`song-row ${isCurrent ? 'active-row' : ''}`}
                onClick={() => onSelectSong(song)}
              >
                <div className="track-number font-mono">
                  {isCurrent && isPlaying ? (
                    <div className="playing-bars">
                      <span></span><span></span><span></span>
                    </div>
                  ) : (
                    String(index + 1).padStart(2, '0')
                  )}
                </div>

                <img src={song.cover} alt={song.title} className="song-thumb" />

                <div className="song-info">
                  <div className="song-title font-semibold">{song.title}</div>
                  <div className="song-meta text-xs flex items-center gap-1">
                    <span className="category-tag-badge uppercase font-bold text-[10px] px-1 py-0.5 rounded bg-amber-900/50 text-amber-300">
                      {song.category}
                    </span>
                    <span>{song.artist}</span> • <span className="opacity-80">{song.movie}</span>
                  </div>
                </div>

                <div className="song-duration text-xs font-mono">{song.duration}</div>

                <div className="action-group" onClick={(e) => e.stopPropagation()}>
                  {/* Download Button */}
                  <button
                    className="action-icon-btn download-btn"
                    onClick={(e) => handleDownload(e, song)}
                    title={`Download ${song.title} MP3`}
                  >
                    <Download size={15} />
                  </button>

                  {/* YouTube External Link */}
                  {song.ytUrl && (
                    <a
                      href={song.ytUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-icon-btn yt-btn"
                      title="Open in YouTube Music"
                    >
                      <ExternalLink size={15} />
                    </a>
                  )}

                  {/* Play / Pause Toggle Button */}
                  <button
                    className={`action-icon-btn play-row-btn ${isCurrent && isPlaying ? 'playing' : ''}`}
                    onClick={() => onSelectSong(song)}
                  >
                    {isCurrent && isPlaying ? <Pause size={15} /> : <Play size={15} />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
