lucide.createIcons();

let player;
let isPlaying = false;
let currentSongIndex = 0;
let progressTimer;

// Base de données avec horodatage des paroles (Synchro Karaoké)
const database = [
  { 
    id: 'fJ9rUzIMcZQ', 
    title: 'Bohemian Rhapsody', 
    artist: 'Queen', 
    cover: 'https://i.scdn.co/image/ab67616d0000b273ce40b521ea80f6f0f58022d2',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    timedLyrics: [
      { time: 0, text: "Is this the real life?" },
      { time: 4, text: "Is this just fantasy?" },
      { time: 8, text: "Caught in a landslide," },
      { time: 12, text: "No escape from reality..." },
      { time: 16, text: "Open your eyes, look up to the skies and see..." }
    ]
  },
  { 
    id: '3JZ_D3ELwOQ', 
    title: 'Midnight City', 
    artist: 'M83', 
    cover: 'https://i.scdn.co/image/ab67616d0000b2735252bd33e144a44b82d02c01',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    timedLyrics: [
      { time: 0, text: "Waiting in a car..." },
      { time: 5, text: "Waiting for a ride in the dark." },
      { time: 10, text: "The night city grows," },
      { time: 15, text: "Look and see her eyes, they glow..." }
    ]
  }
];

function onYouTubeIframeAPIReady() {
  player = new YT.Player('yt-player', {
    height: '0', width: '0',
    videoId: database[0].id,
    events: { 'onStateChange': onStateChange }
  });
}

// CHANGER LE THÈME (SPICETIFY)
function changeTheme(themeName) {
  document.body.className = '';
  if (themeName !== 'default') {
    document.body.classList.add(`theme-${themeName}`);
  }
}

// TÉLÉCHARGER LA MUSIQUE
function downloadCurrentSong() {
  const song = database[currentSongIndex];
  const a = document.createElement('a');
  a.href = song.audioUrl;
  a.download = `${song.artist} - ${song.title}.mp3`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// CHARGER UNE MUSIQUE
function loadSong(index) {
  currentSongIndex = index;
  const song = database[index];

  document.getElementById('player-title').textContent = song.title;
  document.getElementById('player-artist').textContent = song.artist;
  document.getElementById('player-img').src = song.cover;

  // Génération des paroles lumineuses
  const lyricsBox = document.getElementById('lyrics-box');
  lyricsBox.innerHTML = song.timedLyrics.map((l, i) => `
    <div class="lyric-line ${i === 0 ? 'active' : ''}" id="lyric-${i}">${l.text}</div>
  `).join('');

  if (player && player.loadVideoById) {
    player.loadVideoById(song.id);
    isPlaying = true;
    updatePlayBtn();
  }
}

// DÉTECTION EN TEMPS RÉEL DU TEMPS POUR LES PAROLES LUMINEUSES
function syncLyrics(currentTime) {
  const song = database[currentSongIndex];
  song.timedLyrics.forEach((line, index) => {
    const el = document.getElementById(`lyric-${index}`);
    if (!el) return;

    const nextLine = song.timedLyrics[index + 1];
    if (currentTime >= line.time && (!nextLine || currentTime < nextLine.time)) {
      document.querySelectorAll('.lyric-line').forEach(l => l.classList.remove('active'));
      el.classList.add('active');
    }
  });
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
        syncLyrics(cur);
      }
    }
  }, 500);
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

function toggleRightPanel() {
  document.getElementById('app-container').classList.toggle('panel-closed');
}

// RECHERCHE DYNAMIQUE
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

  view.innerHTML = `
    <h2 class="section-title">Résultats pour "${query}"</h2>
    <div class="grid-cards">
      ${results.map((song) => `
        <div class="spotify-card" onclick="loadSong(${database.indexOf(song)})">
          <img src="${song.cover}" alt="Cover">
          <div class="card-title">${song.title}</div>
          <div class="card-desc">${song.artist}</div>
          <div class="play-hover-btn"><i data-lucide="play" style="fill: black; color: black;"></i></div>
        </div>
      `).join('')}
    </div>
  `;
  lucide.createIcons();
});

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
          <div class="play-hover-btn"><i data-lucide="play" style="fill: black; color: black;"></i></div>
        </div>
      `).join('')}
    </div>
  `;
  lucide.createIcons();
}

renderHomePage();
loadSong(0);