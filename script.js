const carousel = document.querySelector('.carousel');
const cards = document.querySelectorAll('.flash-card');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

let activeIndex = 0;
const totalCards = cards.length;

// Define the positions for each card state
const positions = {
    center: { x: 0, y: 0, scale: 1 },
    left: { x: -300, y: -100, scale: 0.8 },
    right: { x: 300, y: 100, scale: 0.8 },
    farLeft: { x: -500, y: -200, scale: 0.6 },
    farRight: { x: 500, y: 200, scale: 0.6 }
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

        card.style.transform = `
            translate(${position.x}px, ${position.y}px)
            scale(${position.scale})
        `;
        card.style.zIndex = offset === 0 ? 5 : 0;
    });
}

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

// Handle keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') movePrev();
    if (e.key === 'ArrowRight') moveNext();
});

// Initial setup
updateCardsPosition();