document.addEventListener("DOMContentLoaded", () => {
    const flashCards = document.querySelectorAll(".flash-card");
    const container = document.querySelector(".flash-card-container");
    let currentIndex = 0;

    function showCard(index) {
        flashCards.forEach((card, i) => {
            card.style.display = i === index ? "block" : "none";
        });
    }

    function nextCard() {
        currentIndex = (currentIndex + 1) % flashCards.length;
        showCard(currentIndex);
    }

    function prevCard() {
        currentIndex = (currentIndex - 1 + flashCards.length) % flashCards.length;
        showCard(currentIndex);
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight") {
            nextCard();
        } else if (event.key === "ArrowLeft") {
            prevCard();
        }
    });

    flashCards.forEach(card => {
        card.addEventListener("click", () => {
            const sectionId = card.id;
            window.location.href = `${sectionId}.html`;
        });
    });

    showCard(currentIndex);
});
