// импорт функции отправки данных
import { sendData } from './api.js';

// импортируем функцию загрузки фото
import { uploadImage } from './image-load.js';

// Импортируем функции из утилитарного модуля (ескейп, показ алерта, скрытие алерта)
import { isEscapeKey, showUploadAlert, hideUploadAlert } from './utils.js';

// импортируем функцию сброса эффектов изображения
import { resetEffectsParameters } from './image-effects.js';

// константы, используемые в модуле
const COMMENT_LENGTH = 140;
const HASHTAGS_AMOUNT = 5;
const PATTERN = /^#[a-zа-яё0-9]{1,19}$/i;

// тексты ошибок
const ErrorsText = {
  HASHTAG_INVALID: 'введён невалидный хэштег',
  HASHTAGS_LIMIT: 'превышено количество хэштегов',
  HASHTAGS_REPEAT: 'хэштеги повторяются',
  COMMENT_LENGTH: 'длина комментария больше 140 символов'
};

const bodyElement = document.querySelector('body');
const imageUploadForm = document.querySelector('.img-upload__form');
const uploadButton = imageUploadForm.querySelector('#upload-submit');
const imageUploadInput = imageUploadForm.querySelector('.img-upload__input');
const uploadOverlay = document.querySelector('.img-upload__overlay');
const uploadOverlayCloseButton = uploadOverlay.querySelector('.img-upload__cancel');
const hashtagsInput = uploadOverlay.querySelector('.text__hashtags');
const commentsInput = uploadOverlay.querySelector('.text__description');

//Создаем экземпляр Пристин
const pristine = new Pristine(imageUploadForm, {
  classTo: 'img-upload__field-wrapper',
  errorTextParent: 'img-upload__field-wrapper',
  errorTextTag: 'div',
  errorTextClass: 'img-upload__field-wrapper--error'
}, true);


// функции для блокировки и разблокировки кнопки отправки формы
const blockUploadButton = () => {
  uploadButton.disabled = true;
};

const unblockUploadButton = () => {
  uploadButton.disabled = false;
};

// функция проверки длины комментария
const validateCommentLength = (value) => value.length <= COMMENT_LENGTH;

// функция получения массива хэштегов в нижнем регистре (фильтром реализован сценарий с множеством пробелов м/у хэштегами)
const getHashtagsArray = (hashtags) => {
  const hashtagsSplited = hashtags.trim().split(' '); // разделили по пробелам
  const hashtagsFiltered = hashtagsSplited.filter((word) => word !== ''); // убрали возможные пустые элементы
  return hashtagsFiltered.map((hashtag) => hashtag.toLowerCase()); // привели к нижнему регистру
};

// функция для проверки количества хэштегов
const validateHashtagsAmount = (value) => getHashtagsArray(value).length <= HASHTAGS_AMOUNT;

// функция проверки хэштегов на соответствие паттерну
const validateHashtagsPattern = (value) => {
  const isCorrect = (currentValue) => PATTERN.test(currentValue);
  return getHashtagsArray(value).every(isCorrect);
};

// функция проверки хэштегов на уникальность
const validateHastagsAreUnique = (value) => {
  const array = getHashtagsArray(value);
  const set = new Set(array);
  return (array.length === [...set].length);
};

// функция закрытия модального окна по Esc
const onDocumentKeyDown = (evt) => {
  const activeElement = document.activeElement; // ПРАВКА - добавлено условие на активные поля хэштега и коммента
  const err = document.querySelector('.error'); // условие, чтобы не закрывалось, когда алерт выведен
  const ok = document.querySelector('.success');
  if (isEscapeKey(evt) && activeElement !== commentsInput && activeElement !== hashtagsInput && !err && !ok) {
    evt.preventDefault();
    closeUploadOverlay();
  }
};

// Функция открытия модального окна
const openUploadOverlay = () => {
  uploadOverlay.classList.remove('hidden');
  bodyElement.classList.add('modal-open');

  document.addEventListener('keydown', onDocumentKeyDown);
};

// Функция закрытия модального окна
function closeUploadOverlay() { // function declaration так как нужно поднятие для использования в onDocumentKeyDown
  uploadOverlay.classList.add('hidden');
  bodyElement.classList.remove('modal-open');
  imageUploadForm.reset(); // вызываем ресет формы после закрытия модального окна
  pristine.reset(); // ресет Пристин (иначе при открытии остаются висеть сообщения об ошибках с прошлого раза)
  resetEffectsParameters(); // вызываем ресет параметров для эффектов изображения

  document.removeEventListener('keydown', onDocumentKeyDown);
}
// функция закрытия алерта по эскейп
const onAlertDocumentKeyDown = (evt) => {
  if (isEscapeKey(evt)) {
    const element = document.querySelector('.success') ? 'success' : 'error';
    evt.preventDefault();
    closeAlert(element);
  }
};

// функция закрытия алерта по клику за краем
const onDocumentClick = (evt) => {
  const element = document.querySelector('.success') ? 'success' : 'error';
  if (evt.target === document.querySelector(`.${element}`)) {
    closeAlert(element);
  }
};

// функция открытия алерта
const openAlert = (result) => {
  showUploadAlert(result);
  document.addEventListener('click', onDocumentClick);
  document.querySelector(`.${result}__button`).addEventListener('click', () => closeAlert(result));
  document.addEventListener('keydown', onAlertDocumentKeyDown);
};

// функция закрытия алерта
function closeAlert(result) { // function declaration так как нужна выше
  hideUploadAlert(result);
  document.removeEventListener('click', onDocumentClick);
  document.removeEventListener('keydown', onAlertDocumentKeyDown);
}

// добавляем валидатор на длину комментария
pristine.addValidator(commentsInput, validateCommentLength, ErrorsText.COMMENT_LENGTH);

// добавляем валидатор на количество хэштегов
pristine.addValidator(hashtagsInput, validateHashtagsAmount, ErrorsText.HASHTAGS_LIMIT);

// добавляем валидатор на паттерн хэштегов
pristine.addValidator(hashtagsInput, validateHashtagsPattern, ErrorsText.HASHTAG_INVALID);

// добавляем валидатор на уникальность хэштегов
pristine.addValidator(hashtagsInput, validateHastagsAreUnique, ErrorsText.HASHTAGS_REPEAT);

// добавляем закрытие модального окна на кнопку
uploadOverlayCloseButton.addEventListener('click', closeUploadOverlay);

// добавляем открытие модального окна на инпут при изменении содержания + загрузку изображения
imageUploadInput.addEventListener('change', () => {
  openUploadOverlay();
  uploadImage();
});

// добавляем событие на отправку формы
imageUploadForm.addEventListener('submit', (evt) => {
  evt.preventDefault();

  const isValid = pristine.validate();
  if (isValid) {
    blockUploadButton(); // блокируем кнопку
    sendData(new FormData(evt.target)) // пробуем отправить
      .then(closeUploadOverlay) // успех - закрываем оверлей
      .then(() => openAlert('success')) // успех - показываем алерт об успехе
      .catch(() => openAlert('error')) // ошибка - показываем алерт об ошибке
      .finally(unblockUploadButton); // в любом случае - разблокируем кнопку
  }
});

