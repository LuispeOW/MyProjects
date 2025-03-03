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

// Add these variables at the top with other constants
let touchStartX = 0;
let touchEndX = 0;

// Add this function after the existing position definitions
function getPositionsForScreenSize() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        return {
            center: { x: 0, y: 90, rotate: 0, scale: 1 },          // Moved down by adding y: 150
            left: { x: -window.innerWidth, y: 250, rotate: -15, scale: 0.85 },
            right: { x: window.innerWidth, y: 250, rotate: 15, scale: 0.85 },
            farLeft: { x: -window.innerWidth * 1.5, y: 350, rotate: -15, scale: 0.7 },
            farRight: { x: window.innerWidth * 1.5, y: 350, rotate: 15, scale: 0.7 }
        };
    }
    return positions; // Return original positions for desktop
}

function updateCardsPosition() {
    const currentPositions = getPositionsForScreenSize();
    // First pass: reset all cards to base layer
    cards.forEach(card => {
        card.style.zIndex = "1";
    });

    cards.forEach((card, index) => {
        let position;
        const offset = (index - activeIndex + totalCards) % totalCards;
        
        switch(offset) {
            case 0: // Active card (center)
                position = currentPositions.center;
                card.style.opacity = 1;
                // Force highest z-index through both style and transform
                card.style.zIndex = "1000";
                position.z = 100; // Add Z translation
                break;
            case 1: // Next card (right)
                position = currentPositions.right;
                card.style.opacity = 0.8;
                position.z = 0;
                break;
            case totalCards - 1: // Previous card (left)
                position = currentPositions.left;
                card.style.opacity = 0.8;
                position.z = 0;
                break;
            case 2: // Far next card
                position = currentPositions.farRight;
                card.style.opacity = 0.6;
                position.z = -100;
                break;
            default: // Far previous card
                position = currentPositions.farLeft;
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

    cards.forEach(card => {
        if (!card.classList.contains('active')) {
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

// Modify the click handler for cards
cards.forEach((card, index) => {
    card.addEventListener('click', () => {
        const diff = (index - activeIndex + totalCards) % totalCards;
        if (diff === 0) {
            // Flip the active card
            card.classList.toggle('flipped');
        } else {
            // Rotate carousel
            if (diff <= totalCards / 2) {
                activeIndex = (activeIndex + 1) % totalCards;
            } else {
                activeIndex = (activeIndex - 1 + totalCards) % totalCards;
            }
            updateCardsPosition();
        }
    });
});

// Add back home button functionality
document.querySelectorAll('.back-home').forEach(button => {
    button.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click event
        const card = button.closest('.flash-card');
        if (card) {
            card.classList.remove('flipped');
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

// Add these touch event listeners after the keyboard event listeners
carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});

carousel.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Prevent scrolling while touching carousel
});

carousel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) > 50) { // Minimum swipe distance
        if (swipeDistance > 0) {
            // Swipe right - go to previous card
            activeIndex = (activeIndex - 1 + totalCards) % totalCards;
        } else {
            // Swipe left - go to next card
            activeIndex = (activeIndex + 1) % totalCards;
        }
        updateCardsPosition();
    }
});

// Initial setup
updateCardsPosition();