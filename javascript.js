const searchInput = document.getElementById("search");
const button = document.getElementById("btn");
const results = document.getElementById("results");
const loading = document.getElementById("loading");
const error = document.getElementById("error");

const sortSelect = document.getElementById("sort");
const filterSelect = document.getElementById("filter");
const themeToggle = document.getElementById("themeToggle");

let allSongs = [];
let favorites = [];


let timer;


button.addEventListener("click", searchMusic);


searchInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    searchMusic();
  }
});


searchInput.addEventListener("input", () => {
  clearTimeout(timer);
  timer = setTimeout(searchMusic, 500);
});


async function searchMusic() {
  const query = searchInput.value.trim();

  if (!query) {
    results.innerHTML = "";
    return;
  }


  results.innerHTML = "";
  error.classList.add("hide");
  loading.classList.remove("hide");

  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=20`
    );

   
    if (!res.ok) {
      throw new Error("API failed");
    }

    const data = await res.json();

    loading.classList.add("hide");


    if (!data.results || data.results.length === 0) {
      results.innerHTML = "<p>No results found</p>";
      return;
    }


    allSongs = data.results.filter(song => song.previewUrl);
    renderSongs();

  } catch (e) {
    console.error(e);
    loading.classList.add("hide");
    error.classList.remove("hide");
  }
}


function renderSongs() {

  let songs = [...allSongs];


  songs = songs.filter(song => {
    if (filterSelect.value === "short") return song.trackTimeMillis < 20000;
    if (filterSelect.value === "long") return song.trackTimeMillis >= 20000;
    return true;
  });



songs = Array.isArray(songs) ? songs : [];

songs.sort((a, b) => {
  const nameA = String(a.trackName || "").toLowerCase();
  const nameB = String(b.trackName || "").toLowerCase();

  if (sortSelect?.value === "za") return nameB.localeCompare(nameA);
  return nameA.localeCompare(nameB);
});


  const songsHTML = songs.map(song => `
    <div class="card">
      <img src="${song.artworkUrl100}" alt="cover">
      <h3>${song.trackName || "No title"}</h3>
      <p>${song.artistName}</p>

      <audio controls src="${song.previewUrl}"></audio>

      <button onclick="toggleFavorite('${song.trackId}')">
        ${favorites.includes(song.trackId) ? "❤️ Favorited" : "🤍 Favorite"}
      </button>

      <button onclick="viewMore('${song.trackViewUrl}')">
        🔍 View More
      </button>
    </div>
  `).join("");

  results.innerHTML = songsHTML || "<p>No results found</p>";
}

sortSelect.addEventListener("change", renderSongs);
filterSelect.addEventListener("change", renderSongs);

function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(fav => fav !== id);
  } else {
    favorites.push(id);
  }
  renderSongs();
}

function viewMore(url) {
  window.open(url, "_blank");
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
});