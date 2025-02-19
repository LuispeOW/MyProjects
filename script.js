document.addEventListener("DOMContentLoaded", function () {
    const cards = document.querySelectorAll(".flash-card");
    let currentIndex = 0;

    function updateCards() {
        cards.forEach((card, index) => {
            card.style.transform = `translateX(${(index - currentIndex) * 300}px) scale(${index === currentIndex ? 1 : 0.8})`;
            card.style.opacity = index === currentIndex ? 1 : 0.5;
        });
    }

    document.getElementById("next").addEventListener("click", function () {
        currentIndex = (currentIndex + 1) % cards.length; // Loops to first card after last
        updateCards();
    });

    document.getElementById("prev").addEventListener("click", function () {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length; // Loops to last card when clicking prev from first
        updateCards();
    });

    updateCards();
});
