document.addEventListener("DOMContentLoaded", function () {
    const cards = document.querySelectorAll(".flash-card");
    const positions = ["position-0", "position-1", "position-2", "position-3"];
    let currentIndex = 0;

    function updatePositions() {
        cards.forEach((card, i) => {
            card.classList.remove(...positions);
            let newIndex = (i - currentIndex + positions.length) % positions.length;
            card.classList.add(positions[newIndex]);
        });
    }

    document.getElementById("next").addEventListener("click", function () {
        currentIndex = (currentIndex + 1) % positions.length;
        updatePositions();
    });

    document.getElementById("prev").addEventListener("click", function () {
        currentIndex = (currentIndex - 1 + positions.length) % positions.length;
        updatePositions();
    });

    updatePositions(); // Initialize positions
});
