const global = {
  currentPage: window.location.pathname,
  api: {
    api_url: 'https://api.themoviedb.org/3/',
    api_key: '85224ca8af08fad3c24c59d4c233bca1',
  }
}

async function fetchAPIData(endpoint) {
  const API_URL = global.api.api_url;
  const API_KEY = global.api.api_key;

  const response = await fetch(`${API_URL}${endpoint}?api_key=${API_KEY}&language=en-US`);
  
  const data = await response.json();

  return data;
  
}

async function displayPopularMovies() {
  const data = await fetchAPIData('movie/popular');

  console.log(data.results);

  data.results.forEach((movie) => {
    const div = document.createElement('div');
    div.classList.add('card');
    div.innerHTML = `
      <a href="/movie-details.html?id=${movie.id}">   
        ${
          movie.poster_path
          ?
          `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
          `
          :
          `
          <img src="images/no-image.png" alt="${movie.title}">
          `
        }    
                
      </a>
      <div class="card-body">
        <h5>${movie.title}</h5>
        <p class="card-text">
          <small class="text-muted">Release date: ${movie.release_date}</small>
        </p>
      </div>
    `;

    document.getElementById('popular-movies').appendChild(div);
  })
  
}

async function displayPopularShows() {
  const data = await fetchAPIData('tv/popular');

  console.log(data.results);

  data.results.forEach((show) => {
    const div = document.createElement('div');
    div.classList.add('card');
    div.innerHTML = `
      <a href="/show-details.html?id=${show.id}">   
        ${
          show.poster_path
          ?
          `
            <img src="https://image.tmdb.org/t/p/w500${show.poster_path}" alt="${show.name}">
          `
          :
          `
          <img src="images/no-image.png" alt="${show.name}">
          `
        }    
                
      </a>
      <div class="card-body">
        <h5>${show.name}</h5>
        <p class="card-text">
          <small class="text-muted">First Air Date: ${show.first_air_date
          }</small>
        </p>
      </div>
    `;

    document.getElementById('popular-shows').appendChild(div);
  })
  
}

function highlightActiveLink() {  
  const links = document.querySelectorAll('.nav-link');

  links.forEach((item) => {
    if(item.getAttribute('href') === global.currentPage) {
      item.classList.add('active');
    }
  })
}

function init() {  
  switch(global.currentPage) {
    case "/":
    case "/index.html":
      displayPopularMovies();
      break;

    case "/shows.html":
      displayPopularShows();
      break;

    case "/movie-details.html":

      break;

    case "/show-details.html":

      break;
  }

  highlightActiveLink();
  // console.log(global.currentPage);

}

document.addEventListener('DOMContentLoaded', init);
