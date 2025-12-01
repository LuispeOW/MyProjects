// Carousel elements and state
const carousel = document.querySelector('.carousel');
const cards = document.querySelectorAll('.flash-card');

let activeIndex = 0;
const totalCards = cards.length;

// Card positioning for carousel rotation
const positions = {
    center: { x: 0, y: 50, rotate: 0, scale: 1 },
    left: { x: -600, y: 200, rotate: -15, scale: 0.85 },
    right: { x: 600, y: 200, rotate: 15, scale: 0.85 },
    farLeft: { x: -600, y: 800, rotate: -15, scale: 0.7 },
    farRight: { x: 600, y: 800, rotate: 15, scale: 0.7 }
};

// Touch event tracking
let touchStartX = 0;
let touchEndX = 0;

// Get positions adjusted for screen size
function getPositionsForScreenSize() {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        return {
            center: { x: 0, y: 90, rotate: 0, scale: 1 },
            left: { x: -window.innerWidth, y: 250, rotate: -15, scale: 0.85 },
            right: { x: window.innerWidth, y: 250, rotate: 15, scale: 0.85 },
            farLeft: { x: -window.innerWidth * 1.5, y: 350, rotate: -15, scale: 0.7 },
            farRight: { x: window.innerWidth * 1.5, y: 350, rotate: 15, scale: 0.7 }
        };
    }
    return positions;
}

// Update card positions in the carousel
function updateCardsPosition() {
    const currentPositions = getPositionsForScreenSize();

    cards.forEach((card, index) => {
        const offset = (index - activeIndex + totalCards) % totalCards;
        let position;
        let opacity;
        let zIndex;

        // Determine position based on offset from active card
        switch(offset) {
            case 0: // Active card (center)
                position = currentPositions.center;
                opacity = 1;
                zIndex = 1000;
                position.z = 100;
                break;
            case 1: // Next card (right)
                position = currentPositions.right;
                opacity = 0.8;
                zIndex = 1;
                position.z = 0;
                break;
            case totalCards - 1: // Previous card (left)
                position = currentPositions.left;
                opacity = 0.8;
                zIndex = 1;
                position.z = 0;
                break;
            case 2: // Far next card
                position = currentPositions.farRight;
                opacity = 0.6;
                zIndex = 1;
                position.z = -100;
                break;
            default: // Far previous card
                position = currentPositions.farLeft;
                opacity = 0.6;
                zIndex = 1;
                position.z = -100;
                break;
        }

        // Apply styles
        card.style.transform = `
            translate3d(${position.x}px, ${position.y}px, ${position.z || 0}px)
            rotate(${position.rotate}deg)
            scale(${position.scale})
        `;
        card.style.opacity = opacity;
        card.style.zIndex = zIndex;

        // Set active state
        if (offset === 0) {
            card.style.cursor = 'pointer';
            card.classList.add('active');
        } else {
            card.style.cursor = 'default';
            card.classList.remove('active');
            card.classList.remove('flipped');
        }
    });
}

// Handle keyboard navigation
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowLeft':
            activeIndex = (activeIndex - 1 + totalCards) % totalCards;
            updateCardsPosition();
            break;
        case 'ArrowRight':
            activeIndex = (activeIndex + 1) % totalCards;
            updateCardsPosition();
            break;
        case 'Enter':
            const activeCard = document.querySelector('.flash-card.active');
            if (activeCard) {
                activeCard.classList.toggle('flipped');
            }
            break;
    }
});

// Card click handler - flip if active, otherwise rotate carousel
cards.forEach((card, index) => {
    card.addEventListener('click', () => {
        const diff = (index - activeIndex + totalCards) % totalCards;

        if (diff === 0) {
            // Flip the active card
            card.classList.toggle('flipped');
        } else {
            // Rotate carousel to clicked card
            if (diff <= totalCards / 2) {
                activeIndex = (activeIndex + 1) % totalCards;
            } else {
                activeIndex = (activeIndex - 1 + totalCards) % totalCards;
            }
            updateCardsPosition();
        }
    });
});

// Touch event handlers for mobile swipe navigation
carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});

carousel.addEventListener('touchmove', (e) => {
    e.preventDefault();
});

carousel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchEndX - touchStartX;

    if (Math.abs(swipeDistance) > 50) {
        if (swipeDistance > 0) {
            // Swipe right - previous card
            activeIndex = (activeIndex - 1 + totalCards) % totalCards;
        } else {
            // Swipe left - next card
            activeIndex = (activeIndex + 1) % totalCards;
        }
        updateCardsPosition();
    }
});

// Handle window resize
window.addEventListener('resize', updateCardsPosition);

// Initialize carousel
updateCardsPosition();