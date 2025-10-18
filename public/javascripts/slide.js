(async () => {
  try {
    const res = await fetch("/stock/random-slide");
    const data = await res.json();
    const container = document.querySelector(".slide .con-card");

    if (!container) return console.error("❌ .con-card not found");

    container.innerHTML = ""; // ล้างก่อน

    let slidesHTML = "";
    console.log(data)
    if (data.status && data.data.length > 0) {
      data.data.forEach((game, index) => {
        const imgSrc = game.image_poster && game.image_poster.trim() !== ""
          ? game.image_poster
          : "/images/default-cover.jpg";

        slidesHTML += `
          <div class="card" index="${index}" data-id="${game.id}">
            <img class="bg" src="${imgSrc}" alt="${game.title}">
            <img class="cover" src="${imgSrc}" alt="${game.title}">
          </div>
        `;
      });
    } else {
      console.warn("⚠️ Using default images — no data from DB");
      slidesHTML = `
        <div class="card active"><img src="/images/default-cover.jpg" class="cover"></div>
      `;
    }

    container.innerHTML = slidesHTML;

    // ✅ เมื่อสร้าง card เสร็จแล้ว ค่อยเริ่ม init slide
    initSlide();

  } catch (err) {
    console.error("Error loading slides:", err);
  }
})();


function initSlide() {
  const slides = document.querySelectorAll('.card');
  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');
  const dotsContainer = document.querySelector('.dots');
  if (slides.length === 0) return;

  let current = 0;
  let interval;

  // ✅ สร้าง dot
  dotsContainer.innerHTML = "";
  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });
  const dots = dotsContainer.querySelectorAll('.dot');

  // ✅ ฟังก์ชันเปลี่ยน slide
  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.remove("active", "naxt");

      if (i === index) {
        slide.classList.add("active");
        slide.style.left = "50%";
        slide.style.transform = "translate(-50%, -2%) scale(0.95)";
        slide.style.filter = "blur(0px) brightness(1)";
        slide.style.opacity = "1";
        slide.style.zIndex = "2";
      } else if (i === index + 1) {
        slide.classList.add("naxt");
        slide.style.left = "100%";
        slide.style.transform = "translate(-107%, 0) scale(0.9)";
        slide.style.filter = "blur(2px) brightness(0.7)";
        slide.style.opacity = "0.8";
        slide.style.zIndex = "1";
      } else if (i === index - 1) {
        slide.style.left = "0%";
        slide.style.transform = "translate(-2%, 0) scale(0.9)";
        slide.style.filter = "blur(2px) brightness(0.7)";
        slide.style.opacity = "0.8";
        slide.style.zIndex = "1";
      } else {
        slide.style.left = "-100vw";
        slide.style.opacity = "0";
        slide.style.filter = "blur(3px)";
        slide.style.zIndex = "0";
      }
    });

    dots.forEach(dot => dot.classList.remove("active"));
    dots[index].classList.add("active");
  }

  // ✅ เปลี่ยน slide
  function goToSlide(i) {
    current = i;
    showSlide(current);
    resetInterval();
  }

  function nextSlideLoop() {
    current = (current + 1) % slides.length;
    showSlide(current);
  }

  function nextSlide() {
    current = (current + 1) % slides.length;
    showSlide(current);
    resetInterval();
  }

  function prevSlide() {
    current = (current - 1 + slides.length) % slides.length;
    showSlide(current);
    resetInterval();
  }

  // ✅ ปุ่ม
  nextBtn.addEventListener("click", nextSlide);
  prevBtn.addEventListener("click", prevSlide);

  // ✅ ตั้ง interval
  function resetInterval() {
    clearInterval(interval);
    interval = setInterval(nextSlideLoop, 4000);
  }

  showSlide(current);
  resetInterval();
}

