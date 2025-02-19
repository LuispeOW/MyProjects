const carousel = document.querySelector('.carousel');
const cards = document.querySelectorAll('.flash-card');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

let activeIndex = 0;
const totalCards = cards.length;

// Define positions for each card state
const positions = {
    center: { x: 0, y: 0, rotate: 0, scale: 1 },
    left: { x: -300, y: window.innerHeight, rotate: -15, scale: 0.9 },
    right: { x: 300, y: window.innerHeight, rotate: 15, scale: 0.9 },
    farLeft: { x: -500, y: window.innerHeight * 1.5, rotate: -30, scale: 0.8 },
    farRight: { x: 500, y: window.innerHeight * 1.5, rotate: 30, scale: 0.8 }
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
        
        // Ensure proper stacking
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

// Initial setup
updateCardsPosition();

// Handle window resize
window.addEventListener('resize', () => {
    // Update positions object with new window height
    positions.left.y = window.innerHeight;
    positions.right.y = window.innerHeight;
    positions.farLeft.y = window.innerHeight * 1.5;
    positions.farRight.y = window.innerHeight * 1.5;
    updateCardsPosition();
});