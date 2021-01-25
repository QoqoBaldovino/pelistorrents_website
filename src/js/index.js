const $actionContainer = document.getElementById('action');
const $dramaContainer = document.getElementById('drama');
const $animationContainer = document.getElementById('animation');
const $featuringContainer = document.getElementById('featuring');
const $form = document.getElementById('form');
const $home = document.getElementById('home');
const featuring = document.getElementById('featuring');

const $modal = document.getElementById('modal');
const $hideModal = document.getElementById('hide-modal');
const $overlay = document.getElementById('overlay');
const $modalImage = $modal.querySelector('img');
const $modalTitle = $modal.querySelector('h1');
const $modalDescription = $modal.querySelector('p');
const $modalTorrent = $modal.querySelector('.modal-torrent > a');

const BASE_API = 'https://yts.am/api/v2/';

(async function load(){

  async function getData(URL){
    const response = await fetch(URL);
    const data = await response.json();

    if(data.data.movie_count > 0){
      return data;
    }
    else{
      throw new Error('No se encontró ninguna pelicula');
    }
  }

  function videoItemTemplate(movie, category){
    return(
      ` <div class="primaryPlaylistItem" data-id=${movie.id} data-category=${category}>
      <div class="primaryPlaylistItem-image">
        <img src="${movie.medium_cover_image}">
      </div>
      <h4 class="primaryPlaylistItem-title">
      ${movie.title}
      </h4>
    </div>`)
  }

  function featuringTemplate(movie){
    return(
      `<div class="featuring">
      <div class="featuring-image">
        <img src="${movie.medium_cover_image}" width="70" height="100" alt="">
      </div>
      <div class="featuring-content">
        <p class="featuring-title">Pelicula encontrada</p>
        <p class="featuring-album">${movie.title}</p>
      </div>
    </div>`
    
    )
  }

  function createTemplateHTML(TemplateString){
    const html = document.implementation.createHTMLDocument();
    html.body.innerHTML = TemplateString;
    return html.body.children[0];
  }

  function findById(list, id){
    return list.find(movie => movie.id === parseInt(id, 10));
  }

  function findMovie(id, category){

    switch(category){
      case 'action':{
        return findById(actionList, id);
      }
      case 'drama':{
        return findById(dramaList, id);
      }
      default: {
        return findById(animationList,id);
      }
    }
  }

  function showModal($element){
    $overlay.classList.add('active');
    $modal.style.animation = 'modalIn .8s forwards'

    const id = $element.dataset.id;
    const category = $element.dataset.category;

    const data = findMovie(id,category);
    $modalTitle.textContent = data.title;
    $modalImage.setAttribute('src', data.medium_cover_image);
    $modalDescription.textContent = data.description_full;
    setAttributes($modalTorrent, {
      href: data.torrents[0].url,
    })
  }

  function hideModal(){
    $overlay.classList.remove('active');
    $modal.style.animation = 'modalOut .8s forwards';
  }

  $modal.addEventListener('click', hideModal);

  function addEventListener($element){
    $element.addEventListener('click', () => {
      showModal($element);
    })
  }

  function renderMovieList(list, $container, category){
    $container.children[0].remove();
    list.forEach((movie) => {
      console.log(movie)
      const stringTemplate = videoItemTemplate(movie, category);
      const movieElement = createTemplateHTML(stringTemplate);
      $container.append(movieElement);
      const image = movieElement.querySelector('img');
      image.addEventListener('load', (event) => {
        event.target.classList.add('fadeIn');
        addEventListener(movieElement);
      })
    })

   
    
  }


  function setAttributes($element, attributes){
    for(const attribute in attributes){
      $element.setAttribute(attribute, attributes[attribute])
      
    }

  }


  $form.addEventListener('submit', async (event) => {
    event.preventDefault();
    $home.classList.add('search-active');
    $featuringContainer.style.display = 'grid';
    const $loader = document.createElement('img');
    setAttributes($loader, {
      src: 'src/images/loader.gif',
      height: 50,
      width: 50,
    })

    $featuringContainer.append($loader);
    const data = new FormData($form);

    try{
      const{
        data: {
          movies: pelicula
        }
      } = await getData(`${BASE_API}list_movies.json?limit=1&query_term=${data.get('name')}`);
      const stringTemplate = featuringTemplate(pelicula[0]);
      $featuringContainer.innerHTML = stringTemplate;
    }catch(error){
      alert(error.message);
      $loader.remove;
      $home.classList.remove('search-active');
    }

  });

  async function cacheExists(category){
    const listName = `${category}List`
    const cacheList = window.localStorage.getItem(`${listName}`);

    if(cacheList){
      return JSON.parse(cacheList);
    }
    else{
      const{
        data: {
          movies: data
        }
      } = await getData(`${BASE_API}list_movies.json?genre=${category}`);

      window.localStorage.setItem(listName, JSON.stringify(data));

      return data;
    }

    
  }

  
  // Obtener datos desde la API de peliculas por genero.
  const actionList = await cacheExists('action');
  renderMovieList(actionList,$actionContainer,'action');
  const dramaList = await cacheExists('drama');
  renderMovieList(dramaList,$dramaContainer,'drama')
  const animationList = await cacheExists('animation');
  renderMovieList(animationList,$animationContainer,'animation');

})()