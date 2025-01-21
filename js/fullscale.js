// Импортируем функцию проверки нажатия Esc
import { isEscapeKey } from './utils.js';

const COMMENTS_PACE = 5; // Константа, задающая шаг - количество показываемых комментариев

// Находим элементы на странице
const bigPicture = document.querySelector('.big-picture');
const bodyElement = document.querySelector('body');
const picturesContainer = document.querySelector('.pictures');
const bigPictureCloseButton = bigPicture.querySelector('.big-picture__cancel');
const bigPictureImgBlock = bigPicture.querySelector('.big-picture__img');
const bigPictureImg = bigPictureImgBlock.querySelector('img');
const bigPictureLikesCount = bigPicture.querySelector('.likes-count');
const bigPictureCommentsCount = bigPicture.querySelector('.social__comment-total-count');
const commentContainer = bigPicture.querySelector('.social__comments');
const shownCommentsCount = bigPicture.querySelector('.social__comment-shown-count');
const bigPictureDescription = bigPicture.querySelector('.social__caption');
const commentsLoader = bigPicture.querySelector('.comments-loader');

// создание модального окна и всей его начинки оборачиваем в функцию для экспорта
const setFullscale = (array) => {
  let active = 0; // Счетчик активных комментариев
  let commentsArray = []; // Временный массив для порционной генерации комментариев

  // Убираем комментарии, поставленные в разметке по умолчанию
  commentContainer.innerHTML = '';

  // Создаем шаблон для добавления комментариев
  const commentTemplate = document.createElement('li');
  commentTemplate.classList.add('social__comment');
  commentTemplate.innerHTML = `<img
    class="social__picture"
    src="{{аватар}}"
    alt="{{имя комментатора}}"
    width="35" height="35">
  <p class="social__text">{{текст комментария}}</p>`;

  // Создаем фрагмент, куда будем добавлять комментарии
  const generatedCommentsFragment = document.createDocumentFragment();

  // Функция, создающая комментарии к фотографии из данных из массива
  const generateComments = (dataArray) => {
    dataArray.forEach(({ avatar, message, name }) => {
      const commentElement = commentTemplate.cloneNode(true);
      commentElement.querySelector('.social__picture').src = avatar;
      commentElement.querySelector('.social__picture').alt = name;
      commentElement.querySelector('.social__text').textContent = message;
      generatedCommentsFragment.appendChild(commentElement);
    });
    commentContainer.appendChild(generatedCommentsFragment);
  };

  // Функция для порционной генерации комментариев
  const getCommentsPortion = () => {
    const portionArray = commentsArray.slice(active, active + COMMENTS_PACE); // пробуем сделать порцию-срез массива
    generateComments(portionArray); // генерируем комменты по этой порции массива
    if ((commentsArray.length - active) <= COMMENTS_PACE) { // скрываем кнопку если эта итерация была последней
      commentsLoader.classList.add('hidden');
    }
    active = active + portionArray.length;
    shownCommentsCount.textContent = active; // обновляем счетчик И обновляем active
  };

  // Функция для обработчика события на нажатие Esc при открытом модальном окне
  const onDocumentKeyDown = (evt) => {
    if (isEscapeKey(evt)) {
      evt.preventDefault();
      closeBigPicture();
    }
  };

  // Функция открытия модального окна
  const openBigPicture = () => {
    bigPicture.classList.remove('hidden');
    bodyElement.classList.add('modal-open');

    document.addEventListener('keydown', onDocumentKeyDown);
  };

  // Функция закрытия модального окна
  function closeBigPicture() { // function declaration так как нужно поднятие для использования в onDocumentKeyDown
    bigPicture.classList.add('hidden');
    bodyElement.classList.remove('modal-open');
    commentsLoader.classList.remove('hidden'); // Открываем кнопку-загрузчик комментариев (это состояние по умолчанию)

    document.removeEventListener('keydown', onDocumentKeyDown);

    // Сбрасываем счетчик активных, временный массив и убираем комментарии:
    active = 0;
    commentsArray = [];
    commentContainer.innerHTML = '';
  }

  // Функция для обработчика события по клику на миниатюру
  const onMiniatureClick = (evt) => {
    if (evt.target.matches('img[class="picture__img"]')) {
      evt.preventDefault();
      // Проверяем дата-атрибут фотографии с ее айди в массиве данных
      const elemData = array.find((element) => element.id === Number(evt.target.dataset.pictureId));
      bigPictureImg.src = elemData.url;
      bigPictureLikesCount.textContent = elemData.likes;
      bigPictureCommentsCount.textContent = elemData.comments.length;
      bigPictureDescription.textContent = elemData.description;
      commentsArray = elemData.comments;
      getCommentsPortion();
      openBigPicture();
    }
  };

  // Добавляем событие на кнопку "Загрузить еще"
  commentsLoader.addEventListener('click', getCommentsPortion);

  // Добавляем событие на кнопку закрытия
  bigPictureCloseButton.addEventListener('click', closeBigPicture);

  // Добавляем событие на миниатюры (родительский элемент)
  picturesContainer.addEventListener('click', onMiniatureClick);
};

export { setFullscale };
