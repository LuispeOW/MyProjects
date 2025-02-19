document.addEventListener("DOMContentLoaded", function () {
    const cards = document.querySelectorAll(".flash-card");
    const totalCards = cards.length;
    let currentIndex = 0;
    
    function updatePositions() {
        cards.forEach((card, index) => {
            let position = (index - currentIndex + totalCards) % totalCards;
            let angle = (position / totalCards) * 360; // Spread cards around a 360-degree circle
            let radians = (angle * Math.PI) / 180;
            let x = Math.cos(radians) * 200; // Adjust for horizontal spread
            let y = Math.sin(radians) * 100; // Adjust for vertical spread
            
            let scale = 0.8 + (0.2 * Math.cos(radians)); // Scaling effect
            let opacity = 0.5 + (0.5 * Math.cos(radians)); // Opacity effect
            
            card.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
            card.style.opacity = opacity;
        });
    }

    document.getElementById("next").addEventListener("click", function () {
        currentIndex = (currentIndex + 1) % totalCards;
        updatePositions();
    });

    document.getElementById("prev").addEventListener("click", function () {
        currentIndex = (currentIndex - 1 + totalCards) % totalCards;
        updatePositions();
    });

    updatePositions();
});
