// Находим необходимые элементы в разметке, создаем фрагмент
const picturesContainer = document.querySelector('.pictures');
const pictureTemplate = document.querySelector('#picture').content;
const picturesFragment = document.createDocumentFragment();

const getMiniatures = (array) => {
  const previousPictures = document.querySelectorAll('.picture'); // чистим контейнер от предыдущего рендеринга
  if (previousPictures.length > 0) {
    previousPictures.forEach((elem) => elem.remove());
  }
  // Используем forEach для переноса данных из массива в подготовленный фрагмент
  array.forEach(({ id, url, description, likes, comments }) => {
    const pictureElement = pictureTemplate.cloneNode(true);
    pictureElement.querySelector('.picture__img').dataset.pictureId = id;
    pictureElement.querySelector('.picture__img').src = url;
    pictureElement.querySelector('.picture__img').alt = description;
    pictureElement.querySelector('.picture__likes').textContent = likes;
    pictureElement.querySelector('.picture__comments').textContent = comments.length;
    picturesFragment.appendChild(pictureElement);
  });

  // Добавляем фрагмент в разметку
  picturesContainer.appendChild(picturesFragment);

};

export { getMiniatures };
