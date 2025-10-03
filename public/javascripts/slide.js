const slides = document.querySelectorAll('.card');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
const dotsContainer = document.querySelector('.dots');

let current = 0;
let interval;

// สร้าง dot ตามจำนวนสไลด์
slides.forEach((_, i) => {
  const dot = document.createElement('span');
  dot.classList.add('dot');
  if (i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => goToSlide(i));
  dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.dot');

function showSlide(i) {
  slides.forEach((slide, s) => {
    slide.classList.remove('active', 'naxt');
    slide.style.transition = "all 1s ease"; // ✅ smooth

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

  dots.forEach(dot => dot.classList.remove('active'));
  dots[i].classList.add('active');
}

function goToSlide(i) {
  current = i;
  showSlide(current);
  resetInterval(); // ✅ reset timer เมื่อคลิก dot
}

function nextSlideLoop() {
  current = (current + 1) % slides.length;
  showSlide(current);
  resetInterval();
}
function nextSlide() {
  if (current < slides.length-1) {
  current = (current + 1) % slides.length;
  showSlide(current);
  resetInterval();
  } 
}

function prevSlide() {
  if (current > 0) {
  current = (current - 1 + slides.length) % slides.length;
  showSlide(current);
  resetInterval(); // ✅ reset timer เมื่อกด prev
  }
}

// ปุ่มคลิก
nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

// Auto slide
function resetInterval() {
  clearInterval(interval);
  interval = setInterval(nextSlideLoop, 3500);
}

showSlide(current);
resetInterval();
