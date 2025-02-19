const carousel = document.querySelector('.carousel');
const cards = document.querySelectorAll('.flash-card');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

let currentRotation = 0;
let activeIndex = 0;
const totalCards = cards.length;

// Position cards in a circle
function positionCards() {
    cards.forEach((card, index) => {
        const angle = (360 / totalCards) * index;
        card.style.transform = `
            rotateY(${angle}deg) 
            translateZ(200px)
            ${index === activeIndex ? 'scale(1.2)' : 'scale(1)'}
        `;
        card.classList.toggle('active', index === activeIndex);
    });
}

// Rotate to next card
function rotateNext() {
    activeIndex = (activeIndex + 1) % totalCards;
    currentRotation -= 360 / totalCards;
    updateCarousel();
}

// Rotate to previous card
function rotatePrev() {
    activeIndex = (activeIndex - 1 + totalCards) % totalCards;
    currentRotation += 360 / totalCards;
    updateCarousel();
}

// Update carousel position
function updateCarousel() {
    carousel.style.transform = `rotateY(${currentRotation}deg)`;
    positionCards();
}

// Event listeners
nextBtn.addEventListener('click', rotateNext);
prevBtn.addEventListener('click', rotatePrev);

cards.forEach((card, index) => {
    card.addEventListener('click', () => {
        const diff = index - activeIndex;
        if (diff > 0) {
            for (let i = 0; i < diff; i++) rotateNext();
        } else if (diff < 0) {
            for (let i = 0; i < Math.abs(diff); i++) rotatePrev();
        }
    });
});

// Initial setup
positionCards();