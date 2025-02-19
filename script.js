document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".flash-card");
    let currentIndex = 0;

    function updateCards() {
        cards.forEach((card, index) => {
            card.classList.remove("hidden");
            if (index === currentIndex) {
                card.style.transform = "translateX(0px) scale(1)";
                card.style.opacity = "1";
            } else if (index === (currentIndex + 1) % cards.length) {
                card.style.transform = "translateX(300px) scale(0.8)";
                card.style.opacity = "0.5";
            } else if (index === (currentIndex - 1 + cards.length) % cards.length) {
                card.style.transform = "translateX(-300px) scale(0.8)";
                card.style.opacity = "0.5";
            } else {
                card.classList.add("hidden");
            }
        });
    }

    document.getElementById("next").addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % cards.length;
        updateCards();
    });

    document.getElementById("prev").addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        updateCards();
    });

    updateCards();
});
