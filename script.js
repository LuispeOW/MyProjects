const carousel = document.querySelector('.carousel');
const cards = document.querySelectorAll('.flash-card');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

let activeIndex = 0;
const totalCards = cards.length;

// Define positions for each card state
const positions = {
    center: { x: 0, y: 0, rotate: 0, scale: 1 },
    left: { x: -250, y: 150, rotate: -15, scale: 0.9 },    // Adjusted to be partially visible
    right: { x: 250, y: 150, rotate: 15, scale: 0.9 },     // Adjusted to be partially visible
    farLeft: { x: -400, y: 250, rotate: -20, scale: 0.8 }, // Moved closer to viewport
    farRight: { x: 400, y: 250, rotate: 20, scale: 0.8 }   // Moved closer to viewport
};

function updateCardsPosition() {
    cards.forEach((card, index) => {
        let position;
        const offset = (index - activeIndex + totalCards) % totalCards;
        
        switch(offset) {
            case 0: // Active card
                position = positions.center;
                break;
            case 1: // Next card
                position = positions.right;
                break;
            case totalCards - 1: // Previous card
                position = positions.left;
                break;
            case 2: // Far next card
                position = positions.farRight;
                break;
            default: // Far previous card
                position = positions.farLeft;
                break;
        }

        // Apply transforms
        card.style.transform = `
            translate(${position.x}px, ${position.y}px)
            rotate(${position.rotate}deg)
            scale(${position.scale})
        `;
        
        // Set z-index based on position
        if (offset === 0) {
            card.style.zIndex = 5;
        } else if (offset === 1 || offset === totalCards - 1) {
            card.style.zIndex = 4;
        } else {
            card.style.zIndex = 3;
        }
    });
}

// Rest of the code remains the same...
function moveNext() {
    activeIndex = (activeIndex + 1) % totalCards;
    updateCardsPosition();
}

function movePrev() {
    activeIndex = (activeIndex - 1 + totalCards) % totalCards;
    updateCardsPosition();
}

// Event listeners
nextBtn.addEventListener('click', moveNext);
prevBtn.addEventListener('click', movePrev);

// Add click handlers for cards
cards.forEach((card, index) => {
    card.addEventListener('click', () => {
        const diff = (index - activeIndex + totalCards) % totalCards;
        if (diff !== 0) {
            if (diff <= totalCards / 2) {
                moveNext();
            } else {
                movePrev();
            }
        }
    });
});

// Initial setup
updateCardsPosition();