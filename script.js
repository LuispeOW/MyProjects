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
    center: { x: 0, y: 0, rotate: 0, scale: 1 },
    left: { x: -850, y: 300, rotate: -15, scale: 0.85 },
    right: { x: 850, y: 300, rotate: 15, scale: 0.85 },
    farLeft: { x: -1200, y: 500, rotate: -25, scale: 0.7 },
    farRight: { x: 1200, y: 500, rotate: 25, scale: 0.7 }
};

function updateCardsPosition() {
    cards.forEach((card, index) => {
        let position;
        const offset = (index - activeIndex + totalCards) % totalCards;
        
        switch(offset) {
            case 0:
                position = positions.center;
                card.style.opacity = 1;
                break;
            case 1:
                position = positions.right;
                card.style.opacity = 0.8;
                break;
            case totalCards - 1:
                position = positions.left;
                card.style.opacity = 0.8;
                break;
            case 2:
                position = positions.farRight;
                card.style.opacity = 0.6;
                break;
            default:
                position = positions.farLeft;
                card.style.opacity = 0.6;
                break;
        }

        // Apply transforms
        card.style.transform = `
            translate(${position.x}px, ${position.y}px)
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