lucide.createIcons();

let player;
let isPlaying = false;
let currentSongIndex = 0;
let progressTimer;

// Base de données simulée pour la recherche instantanée
const database = [
  { id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', artist: 'Queen', cover: 'https://i.scdn.co/image/ab67616d0000b273ce40b521ea80f6f0f58022d2', category: 'Rock' },
  { id: '3JZ_D3ELwOQ', title: 'Midnight City', artist: 'M83', cover: 'https://i.scdn.co/image/ab67616d0000b2735252bd33e144a44b82d02c01', category: 'Electropop' },
  { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', artist: 'Rick Astley', cover: 'https://i.scdn.co/image/ab67616d0000b273ba0be73c727db43b8110e0e1', category: 'Pop' },
  { id: 'hT_nvWreIhg', title: 'Counting Stars', artist: 'OneRepublic', cover: 'https://i.scdn.co/image/ab67616d0000b2739e2f95ae77cf436017ab9cb6', category: 'Pop' },
  { id: 'L_LUpnjgPso', title: 'Starboy', artist: 'The Weeknd', cover: 'https://i.scdn.co/image/ab67616d0000b2734718e241245109ecdb7cf922', category: 'R&B' }
];

const categories = [
  { name: 'Podcasts', color: '#e13a00', img: 'https://i.scdn.co/image/ab6765630000ba8a81f07e120512f4581f4f46e5' },
  { name: 'Concerts', color: '#8400e7', img: 'https://i.scdn.co/image/ab67616d0000b273ce40b521ea80f6f0f58022d2' },
  { name: 'Pop', color: '#148a08', img: 'https://i.scdn.co/image/ab67616d0000b273ba0be73c727db43b8110e0e1' },
  { name: 'Hip-Hop', color: '#bc5900', img: 'https://i.scdn.co/image/ab67616d0000b2734718e241245109ecdb7cf922' },
  { name: 'Rock', color: '#e91429', img: 'https://i.scdn.co/image/ab67616d0000b273ce40b521ea80f6f0f58022d2' },
  { name: 'Électro', color: '#d84000', img: 'https://i.scdn.co/image/ab67616d0000b2735252bd33e144a44b82d02c01' }
];

// YouTube API
function onYouTubeIframeAPIReady() {
  player = new YT.Player('yt-player', {
    height: '0', width: '0',
    videoId: database[0].id,
    events: { 'onStateChange': onStateChange }
  });
}

// Page d'Accueil
function renderHomePage() {
  const view = document.getElementById('content-view');
  view.innerHTML = `
    <h2 class="section-title">Conçu pour vous</h2>
    <div class="grid-cards">
      ${database.map((song, i) => `
        <div class="spotify-card" onclick="playSongDirect(${i})">
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

// Page de Recherche (Parcourir Tout)
function renderSearchPage() {
  const view = document.getElementById('content-view');
  view.innerHTML = `
    <h2 class="section-title">Parcourir tout</h2>
    <div class="search-categories">
      ${categories.map(cat => `
        <div class="category-card" style="background-color: ${cat.color};">
          <span>${cat.name}</span>
          <img src="${cat.img}" alt="${cat.name}">
        </div>
      `).join('')}
    </div>
  `;
  lucide.createIcons();
}

// Moteur de Recherche en Temps Réel
function handleSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  const view = document.getElementById('content-view');

  if (query === '') {
    renderSearchPage();
    return;
  }

  const results = database.filter(s => 
    s.title.toLowerCase().includes(query) || 
    s.artist.toLowerCase().includes(query) ||
    s.category.toLowerCase().includes(query)
  );

  if (results.length === 0) {
    view.innerHTML = `<h2 class="section-title">Aucun résultat trouvé pour "${query}"</h2>`;
    return;
  }

  const topResult = results[0];

  view.innerHTML = `
    <div class="search-results-layout">
      <div>
        <h2 class="section-title">Meilleur résultat</h2>
        <div class="top-result-card" onclick="playSongByObj('${topResult.id}')">
          <img src="${topResult.cover}" alt="Cover">
          <div class="top-result-title">${topResult.title}</div>
          <div class="card-desc" style="margin-bottom: 12px;">${topResult.artist}</div>
          <span class="top-result-badge">Titre</span>
          <div class="play-hover-btn" style="opacity: 1; transform: none; bottom: 20px; right: 20px;">
            <i data-lucide="play" style="fill: black; color: black; margin-left: 2px;"></i>
          </div>
        </div>
      </div>

      <div>
        <h2 class="section-title">Titres</h2>
        <div class="tracks-list">
          ${results.map(s => `
            <div class="track-row" onclick="playSongByObj('${s.id}')">
              <div class="track-left">
                <img src="${s.cover}" alt="Cover">
                <div>
                  <div class="song-name">${s.title}</div>
                  <div class="song-artist">${s.artist}</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
}

// Jouer un morceau
function playSongDirect(index) {
  currentSongIndex = index;
  const song = database[index];
  loadSongIntoPlayer(song);
}

function playSongByObj(id) {
  const song = database.find(s => s.id === id);
  if (song) loadSongIntoPlayer(song);
}

function loadSongIntoPlayer(song) {
  document.getElementById('player-title').textContent = song.title;
  document.getElementById('player-artist').textContent = song.artist;
  document.getElementById('player-img').src = song.cover;

  if (player && player.loadVideoById) {
    player.loadVideoById(song.id);
    isPlaying = true;
    updatePlayButton();
  }
}

function togglePlay() {
  if (!player) return;
  if (isPlaying) player.pauseVideo();
  else player.playVideo();
  isPlaying = !isPlaying;
  updatePlayButton();
}

function updatePlayButton() {
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
  playSongDirect(currentSongIndex);
}

function prevSong() {
  currentSongIndex = (currentSongIndex - 1 + database.length) % database.length;
  playSongDirect(currentSongIndex);
}

function onStateChange(e) {
  if (e.data === YT.PlayerState.ENDED) nextSong();
}

// Navigation Events
document.getElementById('btn-home').addEventListener('click', () => {
  document.getElementById('btn-home').classList.add('active');
  document.getElementById('btn-search-nav').classList.remove('active');
  document.getElementById('header-search').classList.add('hidden');
  renderHomePage();
});

document.getElementById('btn-search-nav').addEventListener('click', () => {
  document.getElementById('btn-search-nav').classList.add('active');
  document.getElementById('btn-home').classList.remove('active');
  document.getElementById('header-search').classList.remove('hidden');
  renderSearchPage();
});

renderHomePage();