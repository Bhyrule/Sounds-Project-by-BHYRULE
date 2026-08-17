lucide.createIcons();

let player;
let isPlaying = false;
let currentSongIndex = 0;
let progressTimer;

// Base de données avec Paroles et Bios
const database = [
  { 
    id: 'fJ9rUzIMcZQ', 
    title: 'Bohemian Rhapsody', 
    artist: 'Queen', 
    cover: 'https://i.scdn.co/image/ab67616d0000b273ce40b521ea80f6f0f58022d2',
    bio: 'Queen est un groupe de rock britannique formé en 1970 à Londres par Freddie Mercury, Brian May et Roger Taylor.',
    lyrics: `Is this the real life?\nIs this just fantasy?\nCaught in a landslide,\nNo escape from reality...\n\nOpen your eyes,\nLook up to the skies and see...`
  },
  { 
    id: '3JZ_D3ELwOQ', 
    title: 'Midnight City', 
    artist: 'M83', 
    cover: 'https://i.scdn.co/image/ab67616d0000b2735252bd33e144a44b82d02c01',
    bio: 'M83 est un groupe français de musique électronique formé en 1999 par Anthony Gonzalez.',
    lyrics: `Waiting in a car\nWaiting for a ride in the dark\nThe night city grows\nLook and see her eyes, they glow...`
  },
  { 
    id: 'dQw4w9WgXcQ', 
    title: 'Never Gonna Give You Up', 
    artist: 'Rick Astley', 
    cover: 'https://i.scdn.co/image/ab67616d0000b273ba0be73c727db43b8110e0e1',
    bio: 'Rick Astley est un chanteur pop britannique devenu célèbre à la fin des années 1980.',
    lyrics: `We're no strangers to love\nYou know the rules and so do I\nA full commitment's what I'm thinking of\nYou wouldn't get this from any other guy...`
  }
];

function onYouTubeIframeAPIReady() {
  player = new YT.Player('yt-player', {
    height: '0', width: '0',
    videoId: database[0].id,
    events: { 'onStateChange': onStateChange }
  });
}

// CORRECTION RECHERCHE INSTANTANÉE
document.getElementById('search-input').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  const view = document.getElementById('content-view');

  if (query === '') {
    renderHomePage();
    return;
  }

  const results = database.filter(s => 
    s.title.toLowerCase().includes(query) || 
    s.artist.toLowerCase().includes(query)
  );

  if (results.length === 0) {
    view.innerHTML = `<h2 class="section-title">Aucun résultat trouvé pour "${query}"</h2>`;
    return;
  }

  view.innerHTML = `
    <h2 class="section-title">Résultats pour "${query}"</h2>
    <div class="grid-cards">
      ${results.map((song) => `
        <div class="spotify-card" onclick="playSongById('${song.id}')">
          <img src="${song.cover}" alt="Cover">
          <div class="card-title">${song.title}</div>
          <div class="card-desc">${song.artist}</div>
          <div class="play-hover-btn">
            <i data-lucide="play" style="fill: black; color: black; margin-left: 2px;"></i>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  lucide.createIcons();
});

// GESTION DU LECTEUR ET DU VOLET DROIT (OPTION A)
function loadSong(index) {
  currentSongIndex = index;
  const song = database[index];

  // Màj Lecteur Bas
  document.getElementById('player-title').textContent = song.title;
  document.getElementById('player-artist').textContent = song.artist;
  document.getElementById('player-img').src = song.cover;

  // Màj Volet Droit
  document.getElementById('panel-cover').src = song.cover;
  document.getElementById('panel-song-title').textContent = song.title;
  document.getElementById('panel-song-artist').textContent = song.artist;
  document.getElementById('panel-artist-bio').textContent = song.bio;
  document.getElementById('lyrics-content').textContent = song.lyrics;

  if (player && player.loadVideoById) {
    player.loadVideoById(song.id);
    isPlaying = true;
    updatePlayBtn();
  }
}

function playSongById(id) {
  const index = database.findIndex(s => s.id === id);
  if (index !== -1) loadSong(index);
}

function togglePlay() {
  if (!player) return;
  if (isPlaying) player.pauseVideo();
  else player.playVideo();
  isPlaying = !isPlaying;
  updatePlayBtn();
}

function updatePlayBtn() {
  const btn = document.getElementById('master-play');
  btn.innerHTML = isPlaying ? `<i data-lucide="pause"></i>` : `<i data-lucide="play"></i>`;
  lucide.createIcons();
  if (isPlaying) startTimer();
  else clearInterval(progressTimer);
}

function startTimer() {
  clearInterval(progressTimer);
  progressTimer = setInterval(() => {
    if (player && player.getCurrentTime) {
      const cur = player.getCurrentTime();
      const tot = player.getDuration();
      if (tot > 0) {
        document.getElementById('progress-fill').style.width = `${(cur / tot) * 100}%`;
        document.getElementById('current-time').textContent = formatTime(cur);
        document.getElementById('total-time').textContent = formatTime(tot);
      }
    }
  }, 1000);
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % database.length;
  loadSong(currentSongIndex);
}

function prevSong() {
  currentSongIndex = (currentSongIndex - 1 + database.length) % database.length;
  loadSong(currentSongIndex);
}

function onStateChange(e) {
  if (e.data === YT.PlayerState.ENDED) nextSong();
}

// TOGGLE VOLET LATÉRAL & ONGLETS
function toggleRightPanel() {
  document.getElementById('app-container').classList.toggle('panel-closed');
}

function switchRightTab(tab) {
  const infoTab = document.getElementById('panel-tab-info');
  const lyricsTab = document.getElementById('panel-tab-lyrics');
  const infoBtn = document.getElementById('tab-info-btn');
  const lyricsBtn = document.getElementById('tab-lyrics-btn');

  if (tab === 'info') {
    infoTab.classList.remove('hidden');
    lyricsTab.classList.add('hidden');
    infoBtn.classList.add('active');
    lyricsBtn.classList.remove('active');
  } else {
    lyricsTab.classList.remove('hidden');
    infoTab.classList.add('hidden');
    lyricsBtn.classList.add('active');
    infoBtn.classList.remove('active');
  }
}

// VUES PRINCIPALES
function renderHomePage() {
  const view = document.getElementById('content-view');
  view.innerHTML = `
    <h2 class="section-title">Recommandés pour vous</h2>
    <div class="grid-cards">
      ${database.map((song, i) => `
        <div class="spotify-card" onclick="loadSong(${i})">
          <img src="${song.cover}" alt="Cover">
          <div class="card-title">${song.title}</div>
          <div class="card-desc">${song.artist}</div>
          <div class="play-hover-btn">
            <i data-lucide="play" style="fill: black; color: black; margin-left: 2px;"></i>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  lucide.createIcons();
}

document.getElementById('btn-home').addEventListener('click', () => {
  document.getElementById('header-search').classList.add('hidden');
  renderHomePage();
});

document.getElementById('btn-search-nav').addEventListener('click', () => {
  document.getElementById('header-search').classList.remove('hidden');
});

// Initialisation
renderHomePage();
loadSong(0);