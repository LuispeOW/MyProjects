document.addEventListener("DOMContentLoaded", function () {
    const cards = document.querySelectorAll(".flash-card");
    let currentIndex = 1;

    function updateCards() {
        cards.forEach((card, index) => {
            let position = (index - currentIndex + cards.length) % cards.length;

            if (position === 0) {
                card.style.transform = "translateY(-200px) scale(0.8)";
                card.style.opacity = "0.5";
                card.style.zIndex = "1";
            } else if (position === 1) {
                card.style.transform = "translateY(0px) scale(1)";
                card.style.opacity = "1";
                card.style.zIndex = "3";
            } else if (position === 2) {
                card.style.transform = "translateY(200px) scale(0.8)";
                card.style.opacity = "0.5";
                card.style.zIndex = "2";
            }
        });
    }

    document.getElementById("next").addEventListener("click", function () {
        currentIndex = (currentIndex + 1) % cards.length;
        updateCards();
    });

    document.getElementById("prev").addEventListener("click", function () {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        updateCards();
    });

    updateCards(); // Initialize positions
});
