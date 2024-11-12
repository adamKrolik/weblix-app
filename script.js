const global = {
  currentPage: window.location.pathname,
  search: {
    term: '',
    type: '',
    page: 1,
    totalPages: 1,
    totalResults: 0,
  },
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

// Search Movies/Shows
async function search() {
  
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  
  global.search.type = urlParams.get('type');
  global.search.term = urlParams.get('search-term');
  
  // if(sessionStorage.getItem('page') !== null) {
  //   global.search.page = sessionStorage.getItem('page'); 
  // } 

  if(global.search.term !== '' && global.search.term !== null) {
    const { results, total_pages, page, total_results } = await searchAPIData();

    global.search.page = page;
    global.search.totalPages = total_pages;
    global.search.totalResults = total_results;
    
    if(results.length === 0) {
      showAlert('No results found');
      return;
    } 

    displaySearchResults(results);

    document.querySelector('#search-term').value = '';
    
  } else {
    showAlert('Please enter a search term');
  }
}

function displaySearchResults(results) {
  
  document.querySelector('#search-results').innerHTML = '';
  document.querySelector('#search-results-heading').innerHTML = '';
  document.querySelector('#pagination').innerHTML = '';

  // sessionStorage.setItem('page', global.search.page);
  
  results.forEach((result) => {
    const div = document.createElement('div');
    div.classList.add('card');
    div.innerHTML = `
      <a href="/${global.search.type === 'movie' ? 'movie' : 'show'}-details.html?id=${result.id}&page=${global.search.page}">   
        ${
          result.poster_path
          ?
          `
            <img src="https://image.tmdb.org/t/p/w500${result.poster_path}" alt="${global.search.type === 'movie' ? result.title : result.name}">
          `
          :
          `
          <img src="images/no-image.png" alt="${global.search.type === 'movie' ? result.title : result.name}">
          `
        }    
                
      </a>
      <div class="card-body">
        <h5>${global.search.type === 'movie' ? result.title : result.name}</h5>
        <p class="card-text">
          <small class="text-muted">Release date: ${global.search.type === 'movie' ? result.release_date : result.first_air_date}</small>
        </p>
      </div>
    `;

    document.querySelector('#search-results-heading').innerHTML = `
        <h2>${results.length} of ${global.search.totalResults} Results for the ${global.search.term}</h2>
    `;

    document.getElementById('search-results').appendChild(div);
  });

  displayPagination();
}

function displayPagination() {  
  const div = document.createElement('div');
  div.classList.add('pagination');
  div.innerHTML = `
    <button class="btn btn-primary" id="prev">Prev</button>
    <button class="btn btn-primary" id="next">Next</button>
    <div class="page-counter">Page ${global.search.page} of ${global.search.totalPages}</div>
  `;

  document.querySelector('#pagination').appendChild(div);

  if(global.search.page === 1) {
    document.querySelector('#prev').disabled = true;
  }

  if(global.search.page === global.search.totalPages) {
    document.querySelector('#next').disabled = true;
  }

  // Next page
  document.querySelector('#next').addEventListener('click', async () => {
    global.search.page++;

    const { results, total_pages } = await searchAPIData();

    displaySearchResults(results);
  });

  document.querySelector('#prev').addEventListener('click', async () => {
    global.search.page--;

    const { results, total_pages } = await searchAPIData();

    displaySearchResults(results);
  });
}

async function searchAPIData() {
  const API_URL = global.api.api_url;
  const API_KEY = global.api.api_key;

  const response = await fetch(`${API_URL}search/${global.search.type}?api_key=${API_KEY}&language=en-US&query=${global.search.term}&page=${global.search.page}`);
  
  const data = await response.json();

  return data;
  
}

// Show Alert
function showAlert(message, className = 'error') {
  const alertEl = document.createElement('div');
  alertEl.classList.add('alert', className);
  alertEl.appendChild(document.createTextNode(message));
  document.querySelector('#alert').appendChild(alertEl);

  setTimeout(() => alertEl.remove(), 3000);
}

async function displaySlider() {
  const { results } = await fetchAPIData('movie/now_playing');
  
  results.forEach((movie) => {
    const div = document.createElement('div');
    div.classList.add('swiper-slide');
    div.innerHTML = `      
        <a href="movie-details.html?id=${movie.id}">
          <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
        </a>
        <h4 class="swiper-rating">
          <i class="fas fa-star text-secondary"></i> ${movie.vote_average.toFixed(1)} / 10
        </h4>      
    `;

    document.querySelector('.swiper-wrapper').appendChild(div);

    
  });
  initSwiper();
  
}

function initSwiper() {
  const swiper = new Swiper('.swiper', {
    slidesPerView: 1,
    spaceBetween: 30,
    freeMode: true,
    loop: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    breakpoints: {
      500: {
        slidesPerView: 2,
      },
      700: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 4,
      },
    }
  });
}

function displayBackdropImage(backdrop) {
  const container = document.querySelector('.flex-container');
  
  const div = document.createElement('div');
  div.setAttribute('class', 'backdrop_image');
  div.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${backdrop})`;
  div.style.width = '100vw';
  div.style.height = '100vh';
  div.style.backgroundRepeat ='no-repeat';
  div.style.backgroundSize = 'cover';
  div.style.backgroundPosition = 'center';
  div.style.position = 'absolute';
  div.style.top = '0';
  div.style.left = '0';
  div.style.zIndex = '-1';
  div.style.opacity = '0.1';

  container.appendChild(div);
}

async function displayPopularMovies() {
  const data = await fetchAPIData('movie/popular');

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

async function displayMovieDetails() {
  const movieId = window.location.search.split('=')[1];
  
  const movie = await fetchAPIData(`movie/${movieId}`);

  const div = document.createElement('div');
  div.innerHTML =
   `
    <div class="flex-container">
        <div class="item">          
          ${
            movie.poster_path
            ?
            `
              <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.original_title}">
            `
            :
            `
            <img src="images/no-image.png" alt="${movie.original_title}">
            `
          }
        </div>
    
        <div class="item">
          <h2>${movie.original_title}</h2>
          <p><i class="fas fa-star text-secondary"></i> ${movie.vote_average.toFixed(1)} / 10</p>
          <br>
          <p>Release Date: ${movie.release_date}</p>
          <br>
          <p>
            ${movie.overview}
          </p>

          <br>

          <b><small>Genres</small></b>
          ${
            movie.genres.map((genre) => `<p>${genre.name}</p>`).join('')
          }

          <br>

          <a href="${movie.homepage}" target="_blank" class="backBtn">Visit Movie Homepage</a>
          
        </div>
      </div>

      <div class="flex-container-bottom">
        <h3>MOVIE INFO</h3>
        <p class="movie-info"><span>Budget: </span>$${addCommasToNumber(movie.budget)}</p>
        <p class="movie-info"><span>Revenue: </span>$${addCommasToNumber(movie.revenue)}</p>
        <p class="movie-info"><span>Runtime: </span>${movie.runtime} minutes</p>
        <p class="movie-info"><span>Status: </span>${movie.status}</p>

        <h4>Production Companies</h4>
        <p>
        ${
          movie.production_companies.map((company) => `<span>${company.name}</span>`).join(', ')
        }
        </p>

      </div>
    `
  ;
  document.getElementById('movie-details').appendChild(div);

  displayBackdropImage(movie.backdrop_path);

}

async function displayShowDetails() {
  const showId = window.location.search.split('=')[1];
  
  const show = await fetchAPIData(`tv/${showId}`);

  const div = document.createElement('div');
  div.innerHTML =
   `
    <div class="flex-container">
        <div class="item">
          
          
          ${
            show.poster_path
            ?
            `
              <img src="https://image.tmdb.org/t/p/w500${show.poster_path}" alt="${show.original_name}">
            `
            :
            `
            <img src="images/no-image.png" alt="${show.original_name}">
            `
          }
        </div>
    
        <div class="item">
          <h2>${show.original_name}</h2>
          <p><i class="fas fa-star text-secondary"></i> ${show.vote_average.toFixed(1)} / 10</p>
          <br>
          <p>Release Date: ${show.first_air_date}</p>
          <br>
          <p>
            ${show.overview}
          </p>

          <br>

          <b><small>Genres</small></b>
          ${
            show.genres.map((genre) => `<p>${genre.name}</p>`).join('')
          }

          <br>

          <a href="${show.homepage}" target="_blank" class="backBtn">Visit Show Homepage</a>
          
        </div>
      </div>

      <div class="flex-container-bottom">
        <h3>TV SHOW INFO</h3>
        <p class="movie-info"><span>Number Of Episodes: </span>${show.number_of_episodes}</p>
        <p class="movie-info"><span>Last Episode To Air: </span>${show.last_episode_to_air.name}</p>        
        <p class="movie-info"><span>Status: </span>${show.status}</p>

        <h4>Production Companies</h4>
        <p>
        ${
          show.production_companies.map((company) => `<span>${company.name}</span>`).join(', ')
        }
        </p>

      </div>
    `
  ;
  document.getElementById('movie-details').appendChild(div);

  displayBackdropImage(show.backdrop_path);

}

function addCommasToNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function highlightActiveLink() {  
  const links = document.querySelectorAll('.nav-link');

  links.forEach((item) => {
    if(item.getAttribute('href') === global.currentPage) {
      item.classList.add('active');
    }
  })
}

// function clearSessionStorage() {
//   if(window.location.pathname !== '/search.html' && window.location.pathname !== '/movie-details.html' && window.location.pathname !== '/show-details.html') {
//     sessionStorage.clear();
//   }
// }

function init() {  
  switch(global.currentPage) {
    case "/":
    case "/index.html":
      displaySlider()
      displayPopularMovies();
      break;

    case "/shows.html":
      displayPopularShows();
      break;

    case "/movie-details.html":      
      displayMovieDetails();
      break;

    case "/show-details.html":
      displayShowDetails();
      break;

    case "/search.html":
      search();
      break;
  }

  highlightActiveLink();
  // clearSessionStorage(); 

}

document.addEventListener('DOMContentLoaded', init);
