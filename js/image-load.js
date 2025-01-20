// типы файлов для проверки
const FILE_TYPES = ['.jpg', '.jpeg', '.png'];

const fileChooser = document.querySelector('#upload-file');
const preview = document.querySelector('.img-upload__preview img');
const effectPreviews = document.querySelectorAll('.effects__preview');

// функция проверки формата и загрузки фото
const uploadImage = () => {
  const file = fileChooser.files[0];
  const fileName = file.name.toLowerCase();
  const matches = FILE_TYPES.some((it) => fileName.endsWith(it));

  if (matches) { // если проверка пройдена - меняем превью и мини-превью эффектов
    preview.src = URL.createObjectURL(file);
    effectPreviews.forEach((element) => {
      element.style.backgroundImage = `url(${URL.createObjectURL(file)})`;
    });
  }
};

// экспортируем функцию загрузки в модуль form (где обрабатываем инпуты)
export {uploadImage};
