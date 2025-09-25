const slides = document.querySelectorAll('.card');
let current = 0;


function showSlide(i) {
  slides.forEach((slide, s) => {
    slide.classList.remove('active');
    slide.classList.remove('naxt');
    if (s === i) {
      slide.style.left = `48%`;
      slide.classList.add('active');
    } else if (s === i - 1) {
      slide.style.left = `-2%`;
    } else if (s === i + 1) {
      slide.style.left = `100%`;
      slide.classList.add('naxt');
    } else if (s < i - 1) {
      slide.style.left = `-100vw`;
    } else {
      slide.style.left = `100vw`;
    }
  });
}


showSlide(current);
if (slides.length > 1) {

  setInterval(() => {
    if (current === slides.length - 1) {
      direction = -1;
    } else if (current === 0) {
      direction = 1;
    }
    current += direction;
    showSlide(current);
  }, 3500);
}
