import os
import json
import re

SONGS_DIR = "public/songs"
OUTPUT_FILE = "src/data/songs.js"

CATEGORIES = [
  { 
    "id": "truck", 
    "name": "ट्रक ड्राइवर (Truck Driver)", 
    "domain": "hornokplease.xyz",
    "siteUrl": "https://hornokplease.xyz",
    "spotifyUrl": "https://open.spotify.com/playlist/2AVjI8Z57bqMJVtU3V9X1Q",
    "ytUrl": "https://music.youtube.com/playlist?list=PLeatb7hupNV_AWUl_7ttbsKeCQh8tF5N4",
    "subtitle": "Highway retro bangers & dhaba vibes", 
    "icon": "Truck" 
  },
  { 
    "id": "salon", 
    "name": "डीलक्स सैलून (Barber Saloon)", 
    "domain": "saloon.wtf",
    "siteUrl": "https://saloon.wtf",
    "spotifyUrl": "https://open.spotify.com/playlist/2AVjI8Z57bqMJVtU3V9X1Q",
    "ytUrl": "https://music.youtube.com/playlist?list=PLTJ1PnzCWyFw",
    "subtitle": "90s Bollywood saloon hits & चंपी मालिश", 
    "icon": "Scissors" 
  },
  { 
    "id": "mistry", 
    "name": "राजू मिस्त्री (Wooden Workshop)", 
    "domain": "rajumistri.onrender.com",
    "siteUrl": "https://rajumistri.onrender.com",
    "spotifyUrl": "https://open.spotify.com/playlist/2AVjI8Z57bqMJVtU3V9X1Q",
    "ytUrl": "https://music.youtube.com/playlist?list=PLUoQz2ARfFa0",
    "subtitle": "Desi labor songs & carpenter tools", 
    "icon": "Wrench" 
  },
  { 
    "id": "rickshaw", 
    "name": "ऑटो रिक्शा (Auto Rickshaw 90s)", 
    "domain": "90s-nostalgiaindia.netlify.app",
    "siteUrl": "https://90s-nostalgiaindia.netlify.app/auto-rickshaw",
    "spotifyUrl": "https://open.spotify.com/playlist/2AVjI8Z57bqMJVtU3V9X1Q",
    "ytUrl": "https://music.youtube.com/playlist?list=PLeatb7hupNV_AWUl_7ttbsKeCQh8tF5N4",
    "subtitle": "Meter down city street beats & 90s nostalgia", 
    "icon": "Car" 
  },
  { 
    "id": "office", 
    "name": "ऑफिस चाय (Corporate / Focus)", 
    "domain": "productivityhindi",
    "siteUrl": "https://truckdrivermusic.in",
    "spotifyUrl": "https://open.spotify.com/playlist/2AVjI8Z57bqMJVtU3V9X1Q",
    "ytUrl": "https://music.youtube.com/playlist?list=PLTJ1PnzCWyFw",
    "subtitle": "Lofi beats, acoustic & chai study dhun", 
    "icon": "Briefcase" 
  },
  { 
    "id": "peace", 
    "name": "रूहानी शांति (Nostalgia Hits)", 
    "domain": "nostalgiahits.in",
    "siteUrl": "https://nostalgiahits.in",
    "spotifyUrl": "https://open.spotify.com/playlist/2AVjI8Z57bqMJVtU3V9X1Q",
    "ytUrl": "https://music.youtube.com/playlist?list=PLeatb7hupNV_AWUl_7ttbsKeCQh8tF5N4",
    "subtitle": "Kun Faya Kun, Ghazals & spiritual chimes", 
    "icon": "HeartHandshake" 
  },
  { 
    "id": "travel", 
    "name": "रोड ट्रिप सफ़र (Travel Highway)", 
    "domain": "truckdrivermusic.in",
    "siteUrl": "https://truckdrivermusic.in",
    "spotifyUrl": "https://open.spotify.com/playlist/2AVjI8Z57bqMJVtU3V9X1Q",
    "ytUrl": "https://music.youtube.com/playlist?list=PLTJ1PnzCWyFw",
    "subtitle": "Safarnama, Indie pop & sunset highway tunes", 
    "icon": "Compass" 
  }
]

COVER_ARTWORKS = {
  "ae kash": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80",
  "dhoom": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&q=80",
  "raju": "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&q=80",
  "barber": "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&q=80",
  "saloon": "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&q=80",
  "rickshaw": "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=500&q=80",
  "auto": "https://images.unsplash.com/photo-1508873696983-2df515122519?w=500&q=80",
  "office": "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=500&q=80",
  "peace": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&q=80",
  "travel": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&q=80"
}

CATEGORY_DEFAULT_COVERS = {
  "truck": "https://images.unsplash.com/photo-1591768793355-74d04bb6608f?w=500&q=80",
  "salon": "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&q=80",
  "mistry": "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&q=80",
  "rickshaw": "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=500&q=80",
  "office": "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=500&q=80",
  "peace": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&q=80",
  "travel": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&q=80"
}

SITE_PLAYLISTS = {
  "mistry": "https://music.youtube.com/playlist?list=PLUoQz2ARfFa0",
  "salon": "https://open.spotify.com/playlist/2AVjI8Z57bqMJVtU3V9X1Q",
  "truck": "https://music.youtube.com/playlist?list=PLeatb7hupNV_AWUl_7ttbsKeCQh8tF5N4",
  "rickshaw": "https://music.youtube.com/playlist?list=PLeatb7hupNV_AWUl_7ttbsKeCQh8tF5N4",
  "office": "https://music.youtube.com/playlist?list=PLTJ1PnzCWyFw",
  "peace": "https://music.youtube.com/playlist?list=PLeatb7hupNV_AWUl_7ttbsKeCQh8tF5N4",
  "travel": "https://music.youtube.com/playlist?list=PLTJ1PnzCWyFw"
}

def clean_title(filename):
    name = filename.replace('.mp3', '').replace('.webm', '')
    name = re.sub(r'\(Lyrical.*?\)', '', name, flags=re.I)
    name = re.sub(r'\(Full Video.*?\)', '', name, flags=re.I)
    name = re.sub(r'\(HD.*?\)', '', name, flags=re.I)
    name = re.sub(r'4K Video Song', '', name, flags=re.I)
    name = re.sub(r'T-Series.*', '', name, flags=re.I)
    parts = [p.strip() for p in name.split('｜') if p.strip()]
    if parts:
        title = parts[0]
        artist = parts[1] if len(parts) > 1 else "Classic 90s Artist"
        movie = parts[2] if len(parts) > 2 else "Bollywood Gold"
    else:
        title = name
        artist = "Classic 90s Artist"
        movie = "Bollywood Gold"
    return title.strip(), artist.strip(), movie.strip()

songs = []
count = 1

for cat in CATEGORIES:
    cat_id = cat["id"]
    cat_dir = os.path.join(SONGS_DIR, cat_id)
    if not os.path.exists(cat_dir):
        continue
    files = sorted([f for f in os.listdir(cat_dir) if f.endswith('.mp3')])
    for filename in files:
        title, artist, movie = clean_title(filename)
        audio_url = f"/songs/{cat_id}/{filename}"
        song_id = f"{cat_id[:2]}-{count}"
        
        cover = CATEGORY_DEFAULT_COVERS.get(cat_id, CATEGORY_DEFAULT_COVERS["truck"])
        title_lower = title.lower()
        for kw, img_url in COVER_ARTWORKS.items():
            if kw in title_lower or kw in cat_id:
                cover = img_url
                break

        songs.append({
            "id": song_id,
            "title": title,
            "artist": artist,
            "movie": movie,
            "category": cat_id,
            "duration": "5:30",
            "audioUrl": audio_url,
            "playlistUrl": cat.get("ytUrl", SITE_PLAYLISTS.get(cat_id, SITE_PLAYLISTS["truck"])),
            "spotifyUrl": cat.get("spotifyUrl"),
            "domain": cat.get("domain"),
            "cover": cover,
            "tags": [cat_id.capitalize(), "Bollywood 90s", "Classic Stream"]
        })
        count += 1

content = f"""// Dhun Safar - Automatically Generated Song Index from Local MP3 Subfolders

export const CATEGORIES = {json.dumps(CATEGORIES, indent=2, ensure_ascii=False)};

export const SONGS = {json.dumps(songs, indent=2, ensure_ascii=False)};
"""

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Generated {len(songs)} songs in {OUTPUT_FILE}")
