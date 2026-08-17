// --- BASE DE DONNÉES DE TEST & ÉTAT LOCAL ---
const localSongs = [
  {
    id: 1,
    title: "Musique 1",
    artist: "Artiste 1",
    cover: "https://via.placeholder.com/150",
    audioSrc: "musique1.mp3"
  },
  {
    id: 2,
    title: "Musique 2",
    artist: "Artiste 2",
    cover: "https://via.placeholder.com/150",
    audioSrc: "musique2.mp3"
  },
  {
    id: 3,
    title: "Musique 3",
    artist: "Artiste 3",
    cover: "https://via.placeholder.com/150",
    audioSrc: "musique3.mp3"
  }
];

let searchTimeout = null;

// --- GESTION DU SCRIPT AU CHARGEMENT ---
document.addEventListener("DOMContentLoaded", () => {
  initSearch();
  initThemeSelect();
  initFullscreenLyrics();
});

// --- RECHERCHE YOUTUBE MUSIC ---
function initSearch() {
  const searchInput = document.querySelector('.header-search-bar input');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();

      clearTimeout(searchTimeout);

      if (query.length < 2) {
        return;
      }

      // Petite pause de 500ms pendant la frappe
      searchTimeout = setTimeout(() => {
        searchMusic(query);
      }, 500);
    });
  }
}

async function searchMusic(query) {
  const contentView = document.querySelector('.content-view');
  if (!contentView) return;

  contentView.innerHTML = `
    <h2 class="section-title">Résultats pour "${query}"</h2>
    <p style="color: var(--text-gray);">Recherche en cours...</p>
  `;

  try {
    const response = await fetch(`https://invidious.nerdvpn.de/api/v1/search?q=${encodeURIComponent(query)}&type=video`);
    const results = await response.json();

    if (!results || results.length === 0) {
      contentView.innerHTML = `
        <h2 class="section-title">Résultats pour "${query}"</h2>
        <p style="color: var(--text-gray);">Aucun résultat trouvé.</p>
      `;
      return;
    }

    let html = `
      <h2 class="section-title">Résultats pour "${query}"</h2>
      <div class="grid-cards">
    `;

    results.slice(0, 12).forEach(item => {
      const thumbnail = item.videoThumbnails ? (item.videoThumbnails.find(t => t.quality === 'medium')?.url || item.videoThumbnails[0]?.url) : '';
      
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

  } catch (error) {
    console.error("Erreur de recherche :", error);
    contentView.innerHTML = `
      <h2 class="section-title">Résultats pour "${query}"</h2>
      <p style="color: #ff5555;">Une erreur est survenue lors de la recherche. Réessaie dans un instant.</p>
    `;
  }
}

function escapeQuotes(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function playYouTubeTrack(videoId, title, artist, cover) {
  console.log("Lecture sélectionnée :", title, "ID:", videoId);
  
  // Met à jour les infos du lecteur en bas à gauche
  const nameEl = document.querySelector('.song-name');
  const artistEl = document.querySelector('.song-artist');
  const imgEl = document.querySelector('.player-left img');

  if (nameEl) nameEl.textContent = title;
  if (artistEl) artistEl.textContent = artist;
  if (imgEl && cover) imgEl.src = cover;
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

// --- GESTION DES PAROLES GRAND ÉCRAN ---
function initFullscreenLyrics() {
  const rightPanel = document.querySelector('.right-panel');
  const overlay = document.querySelector('.fullscreen-lyrics-overlay');
  const closeBtn = document.querySelector('.close-fullscreen-btn');

  if (rightPanel && overlay) {
    rightPanel.addEventListener('click', (e) => {
      // Évite d'ouvrir si on clique sur un bouton spécifique
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