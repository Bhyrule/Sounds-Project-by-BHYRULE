lucide.createIcons();

let player;
let isPlaying = false;
let currentSongIndex = 0;
let progressTimer;

// Données de morceaux
const songs = [
  { id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', artist: 'Queen', cover: 'https://i.scdn.co/image/ab67616d0000b273ce40b521ea80f6f0f58022d2' },
  { id: '3JZ_D3ELwOQ', title: 'Midnight City', artist: 'M83', cover: 'https://i.scdn.co/image/ab67616d0000b2735252bd33e144a44b82d02c01' },
  { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', artist: 'Rick Astley', cover: 'https://i.scdn.co/image/ab67616d0000b273ba0be73c727db43b8110e0e1' }
];

// Initialisation API YouTube pour la vraie musique
function onYouTubeIframeAPIReady() {
  player = new YT.Player('yt-player', {
    height: '0', width: '0',
    videoId: songs[0].id,
    events: { 'onStateChange': onStateChange }
  });
}

function renderHomePage() {
  const view = document.getElementById('content-view');
  view.innerHTML = `
    <h2 class="section-title">Conçu pour vous</h2>
    <div class="grid-cards">
      ${songs.map((song, i) => `
        <div class="spotify-card" onclick="playSong(${i})">
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

function playSong(index) {
  currentSongIndex = index;
  const song = songs[index];
  
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
  if (isPlaying) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
  isPlaying = !isPlaying;
  updatePlayButton();
}

function updatePlayButton() {
  const btn = document.getElementById('master-play');
  btn.innerHTML = isPlaying ? `<i data-lucide="pause"></i>` : `<i data-lucide="play"></i>`;
  lucide.createIcons();
  
  if (isPlaying) {
    startTimer();
  } else {
    clearInterval(progressTimer);
  }
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
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  playSong(currentSongIndex);
}

function prevSong() {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  playSong(currentSongIndex);
}

function onStateChange(e) {
  if (e.data === YT.PlayerState.ENDED) nextSong();
}

// Nav
document.getElementById('btn-home').addEventListener('click', () => {
  document.getElementById('header-search').classList.add('hidden');
  renderHomePage();
});

document.getElementById('btn-search-nav').addEventListener('click', () => {
  document.getElementById('header-search').classList.remove('hidden');
});

renderHomePage();