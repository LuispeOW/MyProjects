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

// Adjusted position values for 700x400 cards
const positions = {
    center: { x: 0, y: 50, rotate: 0, scale: 1 },            // Moved down
    left: { x: -600, y: 200, rotate: -15, scale: 0.85 },     // Brought closer and moved down
    right: { x: 600, y: 200, rotate: 15, scale: 0.85 },      // Brought closer and moved down
    farLeft: { x: -600, y: 800, rotate: -15, scale: 0.7 },   // Brought closer
    farRight: { x: 600, y: 800, rotate: 15, scale: 0.7 }     // Maintains below-screen position
};

function updateCardsPosition() {
    // First pass: reset all cards to base layer
    cards.forEach(card => {
        card.style.zIndex = "1";
    });

    cards.forEach((card, index) => {
        let position;
        const offset = (index - activeIndex + totalCards) % totalCards;
        
        switch(offset) {
            case 0: // Active card (center)
                position = positions.center;
                card.style.opacity = 1;
                // Force highest z-index through both style and transform
                card.style.zIndex = "1000";
                position.z = 100; // Add Z translation
                break;
            case 1: // Next card (right)
                position = positions.right;
                card.style.opacity = 0.8;
                position.z = 0;
                break;
            case totalCards - 1: // Previous card (left)
                position = positions.left;
                card.style.opacity = 0.8;
                position.z = 0;
                break;
            case 2: // Far next card
                position = positions.farRight;
                card.style.opacity = 0.6;
                position.z = -100;
                break;
            default: // Far previous card
                position = positions.farLeft;
                card.style.opacity = 0.6;
                position.z = -100;
                break;
        }

        // Add Z translation to transform
        card.style.transform = `
            translate3d(${position.x}px, ${position.y}px, ${position.z || 0}px)
            rotate(${position.rotate}deg)
            scale(${position.scale})
        `;
        
        if (offset === 0) {
            card.style.cursor = 'pointer';
            card.classList.add('active');
        } else {
            card.style.cursor = 'default';
            card.classList.remove('active');
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
                activeIndex = (activeIndex + 1) % totalCards;
            } else {
                activeIndex = (activeIndex - 1 + totalCards) % totalCards;
            }
            updateCardsPosition();
        }
    });
});

// Handle window resize
window.addEventListener('resize', updateCardsPosition);

// Initial setup
updateCardsPosition();