document.addEventListener("DOMContentLoaded", () => {
    const flashCards = document.querySelectorAll(".flash-card");
    const container = document.querySelector(".flash-card-container");
    let angle = 0;

    // Click event to navigate
    flashCards.forEach(card => {
        card.addEventListener("click", () => {
            const sectionId = card.id;
            window.location.href = `${sectionId}.html`;
        });
    });

    // Rotating effect
    function rotateCards() {
        angle += 1;
        container.style.transform = `rotate(${angle}deg)`;
        requestAnimationFrame(rotateCards);
    }

    rotateCards();
});
