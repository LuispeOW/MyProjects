const carousel = document.querySelector('.carousel');
const cards = document.querySelectorAll('.flash-card');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

let currentRotation = 0;
let activeIndex = 0;
const totalCards = cards.length;

// Position cards in a circle with diagonal rotation
function positionCards() {
    const rotationX = -25; // Tilt the circle forward
    carousel.style.transform = `rotateX(${rotationX}deg) rotateY(${currentRotation}deg)`;
    
    cards.forEach((card, index) => {
        const angle = (360 / totalCards) * index;
        const radians = (angle * Math.PI) / 180;
        
        // Calculate position on the tilted circle
        const transform = `
            rotateY(${angle}deg)
            translateZ(300px)
            rotateX(${Math.sin(radians) * 20}deg)
            ${index === activeIndex ? 'scale(1.2)' : 'scale(1)'}
        `;
        
        card.style.transform = transform;
        card.classList.toggle('active', index === activeIndex);
    });
}

// Rotate to next card
function rotateNext() {
    activeIndex = (activeIndex + 1) % totalCards;
    currentRotation -= 360 / totalCards;
    positionCards();
}

// Rotate to previous card
function rotatePrev() {
    activeIndex = (activeIndex - 1 + totalCards) % totalCards;
    currentRotation += 360 / totalCards;
    positionCards();
}

// Event listeners
nextBtn.addEventListener('click', rotateNext);
prevBtn.addEventListener('click', rotatePrev);

// Add click handlers for cards
cards.forEach((card, index) => {
    card.addEventListener('click', () => {
        const diff = (index - activeIndex + totalCards) % totalCards;
        const shortestPath = diff <= totalCards / 2 ? diff : diff - totalCards;
        
        if (shortestPath > 0) {
            for (let i = 0; i < shortestPath; i++) {
                setTimeout(rotateNext, i * 100);
            }
        } else {
            for (let i = 0; i < Math.abs(shortestPath); i++) {
                setTimeout(rotatePrev, i * 100);
            }
        }
    });
});

// Handle keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') rotatePrev();
    if (e.key === 'ArrowRight') rotateNext();
});

// Initial setup
positionCards();