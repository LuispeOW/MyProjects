const carousel = document.querySelector('.carousel');
const cards = document.querySelectorAll('.flash-card');

let activeIndex = 0;
const totalCards = cards.length;

// Define page URLs for each card
const cardUrls = {
    'card-projects': '/projects.html',
    'card-blog': '/blog.html',
    'card-about': '/about.html',
    'card-contact': '/contact.html'
};

// Adjusted positions to ensure all cards are visible
const positions = {
    center: { x: 0, y: 0, rotate: 0, scale: 1 },
    left: { x: -500, y: 200, rotate: -15, scale: 0.85 },    // Adjusted left position
    right: { x: 500, y: 200, rotate: 15, scale: 0.85 },     // Adjusted right position
    farLeft: { x: -800, y: 300, rotate: -25, scale: 0.7 },  // Adjusted far left
    farRight: { x: 800, y: 300, rotate: 25, scale: 0.7 }    // Adjusted far right
};

function updateCardsPosition() {
    cards.forEach((card, index) => {
        let position;
        const offset = (index - activeIndex + totalCards) % totalCards;
        
        switch(offset) {
            case 0: // Active card (center)
                position = positions.center;
                card.style.opacity = 1;
                break;
            case 1: // Next card (right)
                position = positions.right;
                card.style.opacity = 0.8;
                break;
            case totalCards - 1: // Previous card (left)
                position = positions.left;
                card.style.opacity = 0.8;
                break;
            case 2: // Far next card (far right)
                position = positions.farRight;
                card.style.opacity = 0.6;
                break;
            default: // Far previous card (far left)
                position = positions.farLeft;
                card.style.opacity = 0.6;
                break;
        }

        // Apply transforms with easing
        card.style.transform = `
            translate(${position.x}px, ${position.y}px)
            rotate(${position.rotate}deg)
            scale(${position.scale})
        `;
        
        // Update z-index
        card.style.zIndex = offset === 0 ? 5 : 4 - Math.abs(offset);
        
        // Update cursor and active state
        if (offset === 0) {
            card.style.cursor = 'pointer';
            card.classList.add('active');
        } else {
            card.style.cursor = 'default';
            card.classList.remove('active');
        }
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

// Handle keyboard navigation
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowLeft':
            movePrev();
            break;
        case 'ArrowRight':
            moveNext();
            break;
        case 'Enter':
            const activeCard = document.querySelector('.flash-card.active');
            if (activeCard) {
                const cardClass = Array.from(activeCard.classList).find(cls => cls.startsWith('card-'));
                if (cardClass && cardUrls[cardClass]) {
                    window.location.href = cardUrls[cardClass];
                }
            }
            break;
    }
});

// Add click handlers for cards
cards.forEach((card, index) => {
    card.addEventListener('click', () => {
        const diff = (index - activeIndex + totalCards) % totalCards;
        if (diff === 0) {
            const cardClass = Array.from(card.classList).find(cls => cls.startsWith('card-'));
            if (cardClass && cardUrls[cardClass]) {
                window.location.href = cardUrls[cardClass];
            }
        } else {
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
window.addEventListener('resize', updateCardsPosition);