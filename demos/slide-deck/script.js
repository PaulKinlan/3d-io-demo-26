let currentSlide = 0;
let slidesList = [];
let hashNavigation = false; // true when navigating via popstate/initial load

function getSlideIndexFromHash() {
  const match = window.location.hash.match(/^#slide-(\d+)$/);
  if (match) {
    return parseInt(match[1], 10) - 1; // convert 1-based to 0-based
  }
  return 0;
}

async function loadSlides() {
  try {
    const response = await fetch('./slides.md');
    if (!response.ok) {
      throw new Error("Failed to load slides.md");
    }
    const markdown = await response.text();
    
    // Split the markdown using popular markdown slide separators like --- or ***
    const rawSlides = markdown.split(/\n---\n|\n\*\*\*\n/);
    
    const deck = document.getElementById('deck');
    
    rawSlides.forEach((rawSlide, index) => {
      const slideText = rawSlide.trim();
      if (!slideText) return;
      
      const slideHtml = marked.parse(slideText);
      const slideDiv = document.createElement('div');
      slideDiv.className = 'slide';
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'slide-content';
      contentDiv.innerHTML = slideHtml;
      
      slideDiv.appendChild(contentDiv);
      deck.appendChild(slideDiv);
      slidesList.push(slideDiv);
    });
    
    const startIndex = getSlideIndexFromHash();
    hashNavigation = true;
    showSlide(startIndex);
    hashNavigation = false;
    history.replaceState({ slide: currentSlide }, '', `#slide-${currentSlide + 1}`);
  } catch (err) {
    document.getElementById('deck').innerHTML = `<h1 style="color:red; text-align:center;">Error loading slides.md</h1>`;
  }
}

function showSlide(index) {
  if (slidesList.length === 0) return;
  
  if (index < 0) currentSlide = 0;
  else if (index >= slidesList.length) currentSlide = slidesList.length - 1;
  else currentSlide = index;
  
  slidesList.forEach((slide, i) => {
    if (i === currentSlide) {
      slide.classList.add('active');
    } else {
      slide.classList.remove('active');
    }
  });

  if (!hashNavigation) {
    const hash = `#slide-${currentSlide + 1}`;
    history.pushState({ slide: currentSlide }, '', hash);
  }
}

function nextSlide() {
  showSlide(currentSlide + 1);
}

function prevSlide() {
  showSlide(currentSlide - 1);
}

// Keyboard navigation
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'Space' || e.key === ' ') {
    nextSlide();
  } else if (e.key === 'ArrowLeft') {
    prevSlide();
  }
});

// Click navigation anywhere goes to next slide (unless it's a link or button)
window.addEventListener('click', (e) => {
  if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
    nextSlide();
  }
});

// Browser back/forward navigation
window.addEventListener('popstate', (e) => {
  hashNavigation = true;
  if (e.state && typeof e.state.slide === 'number') {
    showSlide(e.state.slide);
  } else {
    showSlide(getSlideIndexFromHash());
  }
  hashNavigation = false;
});

// Init
loadSlides();
