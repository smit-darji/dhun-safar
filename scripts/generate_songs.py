import os
import json
import re

SONGS_DIR = "public/songs"
OUTPUT_FILE = "src/data/songs.js"

CATEGORIES = [
  { "id": "truck", "name": "ट्रक वाला (Truck Driver)", "subtitle": "Highway retro bangers & dhaba vibes", "icon": "Truck" },
  { "id": "salon", "name": "डीलक्स सैलून (Barber Salon)", "subtitle": "90s Bollywood saloon hits, चंपी मालिश & सीज़र रिदम", "icon": "Scissors" },
  { "id": "mistry", "name": "कारपेंटर मिस्त्री (Wooden Workshop)", "subtitle": "Carpenter tools, saw beats & Punjabi energy", "icon": "Wrench" },
  { "id": "office", "name": "ऑफिस (Corporate / Focus)", "subtitle": "Lofi beats, acoustic & calm study dhun", "icon": "Briefcase" },
  { "id": "peace", "name": "रूहानी शांति (Peace & Sufi)", "subtitle": "Kun Faya Kun, Ghazals & spiritual chimes", "icon": "HeartHandshake" },
  { "id": "travel", "name": "रोड ट्रिप सफ़र (Travel)", "subtitle": "Safarnama, Indie pop & sunset highway tunes", "icon": "Compass" }
]

COVERS = {
  "truck": "https://images.unsplash.com/photo-1591768793355-74d04bb6608f?w=400&q=80",
  "salon": "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80",
  "mistry": "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80",
  "office": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80",
  "peace": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80",
  "travel": "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=400&q=80"
}

def clean_title(filename):
    name = filename.replace('.mp3', '')
    name = re.sub(r'\(Lyrical.*?\)', '', name, flags=re.I)
    name = re.sub(r'\(Full Video.*?\)', '', name, flags=re.I)
    name = re.sub(r'\(HD.*?\)', '', name, flags=re.I)
    name = re.sub(r'4K Video Song', '', name, flags=re.I)
    name = re.sub(r'T-Series.*', '', name, flags=re.I)
    parts = [p.strip() for p in name.split('｜') if p.strip()]
    if parts:
        title = parts[0]
        artist = parts[1] if len(parts) > 1 else "Classic Retro Artist"
        movie = parts[2] if len(parts) > 2 else "Hits Collection"
    else:
        title = name
        artist = "Classic Retro Artist"
        movie = "Hits Collection"
    return title.strip(), artist.strip(), movie.strip()

songs = []
count = 1

for cat_id in ["truck", "salon", "mistry", "office", "peace", "travel"]:
    cat_dir = os.path.join(SONGS_DIR, cat_id)
    if not os.path.exists(cat_dir):
        continue
    files = sorted([f for f in os.listdir(cat_dir) if f.endswith('.mp3')])
    for filename in files:
        title, artist, movie = clean_title(filename)
        audio_url = f"/songs/{cat_id}/{filename}"
        song_id = f"{cat_id[:2]}-{count}"
        songs.append({
            "id": song_id,
            "title": title,
            "artist": artist,
            "movie": movie,
            "category": cat_id,
            "duration": "5:30",
            "audioUrl": audio_url,
            "ytUrl": "https://music.youtube.com",
            "cover": COVERS.get(cat_id, COVERS["truck"]),
            "tags": [cat_id.capitalize(), "Bollywood Retro", "Official Audio"]
        })
        count += 1

content = f"""// Dhun Safar - Automatically Generated Song Index from Local MP3 Subfolders

export const CATEGORIES = {json.dumps(CATEGORIES, indent=2, ensure_ascii=False)};

export const SONGS = {json.dumps(songs, indent=2, ensure_ascii=False)};
"""

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Generated {len(songs)} songs in {OUTPUT_FILE}")
