const form = document.getElementById('search');
const input = document.getElementById('text');
const resultField = document.getElementById('results');

const apiURL = 'https://api.lyrics.ovh';

// Get search results
async function getResults(term) {
  resultField.innerHTML = 'Searching...';
  const response = await fetch(`${apiURL}/suggest/${term}`);
  const data = await response.json();

  renderResults(data.data);
}

// Get song lyrics
async function getLyrics(artist, title) {
  // Create abort controller for requests that take too long (> 5 seconds)
  const controller = new AbortController();
  const signal = controller.signal;

  setTimeout(() => {
    controller.abort();
  }, 5000);


  resultField.innerHTML = 'Retrieving lyrics...';
  const response = await fetch(`${apiURL}/v1/${artist}/${title}`, {signal});
  const data = await response.json();

  // REGEX for clean rendering - replacing \r\n w/ >br>
  const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, '<br>');
  resultField.innerHTML = `
    <div class="lyrics-container">
      <h2><strong>${artist}</strong> - ${title}</h2>
      <span>${lyrics}</span>
    </div>
    `;
}

// Render results to DOM
function renderResults(data) {
  const htmlData = data.map(song => {
    return (
      `<li data-artist="${song.artist.name}" data-title="${song.title}">
      <p><strong>${song.artist.name}</strong> - ${song.title}</p>
      <button data-artist="${song.artist.name}" data-title="${song.title}" class="lyric-btn">Get Lyrics</button></li>
      `);
  });
  resultField.innerHTML = `<ul>${htmlData.join('')}</ul>`
}


// Event Listener for form submit
form.addEventListener('submit', e => {
  e.preventDefault();

  searchTerm = input.value;
  getResults(searchTerm);
});

// Event listener for lyric search
resultField.addEventListener('click', e => {
  if (e.target.nodeName === 'BUTTON') {
    const artist = e.target.getAttribute('data-artist');
    const title = e.target.getAttribute('data-title');

    // If lyric request takes more than five seconds, request aborts and
    // throw error.
    getLyrics(artist, title).catch(e => {
      resultField.innerHTML = 'Lyrics are not available for this song. Please make another selection.';
    });
  }
});
