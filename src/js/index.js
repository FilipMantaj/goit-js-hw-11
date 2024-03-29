import Notiflix from 'notiflix';
import axios from 'axios';
import { simpleLightbox } from './simplelightbox.js';

const form = document.querySelector('#search-form');
const input = document.querySelector('#search-form input');
const gallery = document.querySelector('.gallery');

let currentPage = 1;
let limit;
let newLimit;
let perPage = 0;
let previousValue;

form.addEventListener('submit', onSubmit);

async function onSubmit(event) {
  event.preventDefault();

  if (input.value.trim('') === '') {
    Notiflix.Notify.warning('Please fill the field with at least one word');
    return;
  }

  if (input.value === previousValue) {
    loadMore();
  } else {
    await getPictures(currentPage);

    if (newLimit === 0) {
      Notiflix.Notify.failure('There are no photos matching your query.');
      return;
    }

    gallery.innerHTML = '';
    currentPage = 1;

    Notiflix.Notify.success(`Hooray! We found ${newLimit} images.`);

    setTimeout(() => {
      window.scrollBy({
        top: 160,
        behavior: 'smooth',
      });
    }, 100);
  }
  await getPictures(currentPage);

  previousValue = input.value;
}

async function getPictures(currentPage) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: '42513703-cc305044521a10f5f63ac2280',
        q: input.value.trim(''),
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: 40,
      },
    });

    const pictures = response.data.hits;
    showPictures(pictures);

    if (currentPage === 1) {
      limit = response.data.totalHits;
      perPage = pictures.length;
      newLimit = limit;
    }

    simpleLightbox();
  } catch {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

function showPictures(pictures) {
  pictures.forEach(picture => {
    const markup = `
      <div class="photo-card">
        <a class="link" href="${picture.largeImageURL}"><img class="thumbnail" src="${picture.webformatURL}" alt="${picture.tags}" loading="lazy" /></a>
        <div class="info">
          <p class="info-item">
            <b>Likes</b>: ${picture.likes}
          </p>
          <p class="info-item">
            <b>Views</b>: ${picture.views}
          </p>
          <p class="info-item">
            <b>Comments</b>: ${picture.comments}
          </p>
          <p class="info-item">
            <b>Downloads</b>: ${picture.downloads}
          </p>
        </div>
      </div>
    `;

    gallery.insertAdjacentHTML('beforeend', markup);
  });
}

async function loadMore() {
  try {
    currentPage++;
    await getPictures(currentPage);

    limit -= perPage;

    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect('.photo-card');

    window.scrollBy({
      top: cardHeight,
      behavior: 'smooth',
    });

    if (limit <= 0) {
      window.removeEventListener('scroll', infiniteScroll);
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch {
    Notiflix.Notify.failure('Failed to load more photos');
  }
}

function infiniteScroll() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 5) {
    loadMore();
  }
}

window.addEventListener('scroll', infiniteScroll, { passive: true });