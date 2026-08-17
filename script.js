// --- BASE DE DONNÉES LOCALES & ÉTAT GLOBAL ---
let searchTimeout = null;
let ytPlayer = null; // Instance du lecteur YouTube

// Liste de serveurs Invidious de secours pour garantir que la recherche fonctionne TOUJOURS
const INVIDIOUS_INSTANCES = [
  'https://invidious.nerdvpn.de',
  'https://inv.riverside.rocks',
  'https://invidious.drgns.space',
  'https://vid.puffyan.us',
  'https://invidious.flokinet.to'
];

// --- INITIALISATION DU LECTEUR YOUTUBE CACHÉ ---
// Chargement de l'API YouTube IFrame en arrière-plan
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Fonction appelée automatiquement quand l'API YouTube est prête
window.onYouTubeIframeAPIReady = function() {
  ytPlayer = new YT.Player('yt-hidden-player', {
    height: '0',
    width: '0',
    videoId: '',
    playerVars: {
      'autoplay': 1,
      'controls': 0
    },
    events: {
      'onStateChange': onPlayerStateChange
    }
  });
};

function onPlayerStateChange(event) {
  const playBtn = document.querySelector('.play-circle');
  if (!playBtn) return;

  // Si la musique joue (state = 1)
  if (event.data === YT.PlayerState.PLAYING) {
    playBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="black">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>`;
  } else { // Pause ou arrêté
    playBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="black">
        <path d="M8 5v14l11-7z"/>
      </svg>`;
  }
}

// --- INITIALISATION DES ÉVÉNEMENTS ---
document.addEventListener("DOMContentLoaded", () => {
  // Injecter un div masqué pour l'API YouTube s'il n'existe pas
  if (!document.getElementById('yt-hidden-player')) {
    const div = document.createElement('div');
    div.id = 'yt-hidden-player';
    div.style.display = 'none';
    document.body.appendChild(div);
  }

  initSearch();
  initPlayerControls();
  initThemeSelect();
  initFullscreenLyrics();
});

// --- RECHERCHE YOUTUBE AVEC SERVEURS DE SECOURS ---
function initSearch() {
  const searchInput = document.querySelector('.header-search-bar input');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      clearTimeout(searchTimeout);

      if (query.length < 2) return;

      searchTimeout = setTimeout(() => {
        searchMusicWithFallback(query);
      }, 400);
    });
  }
}

async function searchMusicWithFallback(query) {
  const contentView = document.querySelector('.content-view');
  if (!contentView) return;

  contentView.innerHTML = `
    <h2 class="section-title">Résultats pour "${query}"</h2>
    <p style="color: var(--text-gray);">Recherche en cours...</p>
  `;

  let results = null;

  // On teste chaque serveur de la liste jusqu'à ce qu'un fonctionne
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 sec max par serveur

      const response = await fetch(`${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        results = await response.json();
        if (results && results.length > 0) break; // Recherche réussie !
      }
    } catch (e) {
      console.warn(`Serveur ${instance} indisponible, tentative sur le suivant...`);
    }
  }

  if (!results || results.length === 0) {
    contentView.innerHTML = `
      <h2 class="section-title">Résultats pour "${query}"</h2>
      <p style="color: var(--text-gray);">Aucun résultat trouvé. Réessaie avec d'autres mots-clés.</p>
    `;
    return;
  }

  // Affichage des cartes de résultats
  let html = `
    <h2 class="section-title">Résultats pour "${query}"</h2>
    <div class="grid-cards">
  `;

  results.slice(0, 12).forEach(item => {
    const thumbnail = item.videoThumbnails ? (item.videoThumbnails.find(t => t.quality === 'medium')?.url || item.videoThumbnails[0]?.url) : `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`;
    
    html += `
      <div class="spotify-card" onclick="playYouTubeTrack('${item.videoId}', '${escapeQuotes(item.title)}', '${escapeQuotes(item.author)}', '${thumbnail}')">
        <img src="${thumbnail}" alt="${item.title}" />
        <div class="card-title">${item.title}</div>
        <div class="card-desc">${item.author}</div>
        <div class="play-hover-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="black">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  contentView.innerHTML = html;
}

// Nettoyage des chaînes pour éviter les erreurs JavaScript au clic
function escapeQuotes(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// --- LECTURE AUDIO DES MORCEAUX YOUTUBE ---
function playYouTubeTrack(videoId, title, artist, cover) {
  // 1. Mettre à jour la jaquette et le nom dans la barre de lecture du bas
  const nameEl = document.querySelector('.song-name');
  const artistEl = document.querySelector('.song-artist');
  const imgEl = document.querySelector('.player-left img');

  if (nameEl) nameEl.textContent = title;
  if (artistEl) artistEl.textContent = artist;
  if (imgEl && cover) imgEl.src = cover;

  // 2. Lancer la musique avec le lecteur YouTube
  if (ytPlayer && ytPlayer.loadVideoById) {
    ytPlayer.loadVideoById(videoId);
  }
}

// --- CONTRÔLES DU PLAYER (BOUTON PLAY / PAUSE) ---
function initPlayerControls() {
  const playBtn = document.querySelector('.play-circle');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (!ytPlayer) return;

      const state = ytPlayer.getPlayerState();
      if (state === YT.PlayerState.PLAYING) {
        ytPlayer.pauseVideo();
      } else {
        ytPlayer.playVideo();
      }
    });
  }
}

// --- THÈMES ---
function initThemeSelect() {
  const themeSelect = document.querySelector('.theme-select');
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      document.body.className = '';
      if (e.target.value !== 'default') {
        document.body.classList.add(`theme-${e.target.value}`);
      }
    });
  }
}

// --- PAROLES GRAND ÉCRAN ---
function initFullscreenLyrics() {
  const rightPanel = document.querySelector('.right-panel');
  const overlay = document.querySelector('.fullscreen-lyrics-overlay');
  const closeBtn = document.querySelector('.close-fullscreen-btn');

  if (rightPanel && overlay) {
    rightPanel.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') {
        overlay.classList.remove('hidden');
      }
    });
  }

  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      overlay.classList.add('hidden');
    });
  }
}