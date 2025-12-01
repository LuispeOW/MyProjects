const cards = document.querySelectorAll('.card');
let activeIndex = 0;
let touchStartX = 0;

// Position configurations
const getPositions = () => {
    const isMobile = window.innerWidth <= 768;
    const offset = isMobile ? window.innerWidth : 600;

    return {
        center: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, z: 50 },
        left: { x: -offset, y: 150, rotate: -15, scale: 0.85, opacity: 0.8, z: 0 },
        right: { x: offset, y: 150, rotate: 15, scale: 0.85, opacity: 0.8, z: 0 },
        hidden: { x: 0, y: 800, rotate: 0, scale: 0.7, opacity: 0.6, z: -50 }
    };
};

function updateCards() {
    const positions = getPositions();

    cards.forEach((card, index) => {
        const offset = (index - activeIndex + cards.length) % cards.length;
        let position;

        // Determine position based on offset
        if (offset === 0) {
            position = positions.center;
            card.classList.add('active');
        } else if (offset === 1) {
            position = positions.right;
            card.classList.remove('active', 'flipped');
        } else if (offset === cards.length - 1) {
            position = positions.left;
            card.classList.remove('active', 'flipped');
        } else {
            position = positions.hidden;
            card.classList.remove('active', 'flipped');
        }

        // Apply transforms
        card.style.transform = `
            translate(-50%, -50%)
            translate3d(${position.x}px, ${position.y}px, ${position.z}px)
            rotateY(0deg)
            rotateZ(${position.rotate}deg)
            scale(${position.scale})
        `;
        card.style.opacity = position.opacity;
        card.style.zIndex = offset === 0 ? 100 : 1;
    });
}

function rotateCarousel(direction) {
    activeIndex = (activeIndex + direction + cards.length) % cards.length;
    updateCards();
}

// Card click handler
cards.forEach((card, index) => {
    card.addEventListener('click', () => {
        if (card.classList.contains('active')) {
            card.classList.toggle('flipped');
        } else {
            const diff = (index - activeIndex + cards.length) % cards.length;
            rotateCarousel(diff <= cards.length / 2 ? 1 : -1);
        }
    });
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        rotateCarousel(-1);
    } else if (e.key === 'ArrowRight') {
        rotateCarousel(1);
    } else if (e.key === 'Enter') {
        const activeCard = document.querySelector('.card.active');
        if (activeCard) {
            activeCard.classList.toggle('flipped');
        }
    }
});

// Touch/swipe support
document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});

document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchEndX - touchStartX;

    if (Math.abs(swipeDistance) > 50) {
        rotateCarousel(swipeDistance > 0 ? -1 : 1);
    }
});

// Window resize handler
window.addEventListener('resize', updateCards);

// Initialize
updateCards();
