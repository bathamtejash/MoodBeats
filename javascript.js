const searchInput = document.getElementById("search");
const button = document.getElementById("btn");
const results = document.getElementById("results");
const loading = document.getElementById("loading");
const error = document.getElementById("error");


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


    const filteredSongs = data.results.filter(song => song.previewUrl);


    const sortedSongs = filteredSongs.sort((a, b) =>
      (a.trackName || "").localeCompare(b.trackName || "")
    );


    const songsHTML = sortedSongs
      .map(song => `
        <div class="card">
          <img src="${song.artworkUrl100}" alt="cover">
          <h3>${song.trackName || "No title"}</h3>
          <p>${song.artistName}</p>
          <audio controls src="${song.previewUrl}"></audio>
        </div>
      `)
      .join("");

    results.innerHTML = songsHTML;

  } catch (e) {
    console.error(e);
    loading.classList.add("hide");
    error.classList.remove("hide");
  }
}