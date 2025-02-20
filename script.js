const carousel = document.querySelector('.carousel');
const cards = document.querySelectorAll('.flash-card');

let activeIndex = 0;
const totalCards = cards.length;

// Adjusted position values for 700x400 cards
const positions = {
    center: { x: 0, y: 50, rotate: 0, scale: 1 },            // Moved down
    left: { x: -600, y: 200, rotate: -15, scale: 0.85 },     // Brought closer and moved down
    right: { x: 600, y: 200, rotate: 15, scale: 0.85 },      // Brought closer and moved down
    farLeft: { x: -600, y: 800, rotate: -15, scale: 0.7 },   // Brought closer
    farRight: { x: 600, y: 800, rotate: 15, scale: 0.7 }     // Maintains below-screen position
};

function updateCardsPosition() {
    cards.forEach((card, index) => {
        // Skip positioning for flipped cards
        if (card.classList.contains('flipped')) {
            return;
        }

        let position;
        const offset = (index - activeIndex + totalCards) % totalCards;
        
        switch(offset) {
            case 0: // Active card
                position = positions.center;
                card.style.opacity = 1;
                card.style.zIndex = "1000";
                card.classList.add('active');
                break;
            case 1: // Right card
                position = positions.right;
                card.style.opacity = 0.8;
                card.classList.remove('active');
                break;
            case totalCards - 1: // Left card
                position = positions.left;
                card.style.opacity = 0.8;
                card.classList.remove('active');
                break;
            case 2: // Far right
                position = positions.farRight;
                card.style.opacity = 0.6;
                card.classList.remove('active');
                break;
            default: // Far left
                position = positions.farLeft;
                card.style.opacity = 0.6;
                card.classList.remove('active');
                break;
        }

        if (!card.classList.contains('flipped')) {
            card.style.transform = `
                translate3d(${position.x}px, ${position.y}px, ${position.z || 0}px)
                rotate(${position.rotate}deg)
                scale(${position.scale})
            `;
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

// Modify click handler
cards.forEach((card, index) => {
    card.addEventListener('click', () => {
        const diff = (index - activeIndex + totalCards) % totalCards;
        if (diff === 0) {
            // Handle flip
            cards.forEach(c => {
                if (c !== card) {
                    c.classList.remove('flipped');
                }
            });
            card.classList.toggle('flipped');
        } else {
            // Handle rotation
            activeIndex = (diff <= totalCards / 2) 
                ? (activeIndex + 1) % totalCards 
                : (activeIndex - 1 + totalCards) % totalCards;
            updateCardsPosition();
        }
    });
});

// Back home button handler
document.querySelectorAll('.back-home').forEach(button => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = button.closest('.flash-card');
        if (card) {
            card.classList.remove('flipped');
            updateCardsPosition();
        }
    });
});

function getTransform(position, isHovered = false) {
    const scale = isHovered ? position.scale * 1.1 : position.scale; // Slightly larger scale on hover
    const z = isHovered ? (position.z || 0) + 30 : position.z || 0; // Slight pop out effect
    
    return `
        translate3d(${position.x}px, ${position.y}px, ${z}px)
        rotate(${position.rotate}deg)
        scale(${scale})
    `;
}

// Add hover event listeners
cards.forEach(card => {
    card.addEventListener('mouseenter', (e) => {
        // Prevent event from triggering click
        e.stopPropagation();
        if (card.position) {
            card.style.transform = getTransform(card.position, true);
            card.style.filter = 'brightness(1.2)';
            card.style.boxShadow = '0 25px 60px rgba(0,0,0,0.4)';
        }
    });

    card.addEventListener('mouseleave', (e) => {
        // Prevent event from triggering click
        e.stopPropagation();
        if (card.position) {
            card.style.transform = getTransform(card.position, false);
            card.style.filter = 'none';
            card.style.boxShadow = '0 20px 50px rgba(0,0,0,0.3)';
        }
    });
});

// Handle window resize
window.addEventListener('resize', updateCardsPosition);

// Initial setup
updateCardsPosition();