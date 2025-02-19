document.addEventListener("DOMContentLoaded", () => {
    const slider = document.querySelector(".slider");
    const sections = document.querySelectorAll(".slide");
    const totalSections = sections.length;
    let currentIndex = 0;

    const nextButton = document.createElement("button");
    nextButton.innerHTML = "&#9654;";
    nextButton.classList.add("next");

    const prevButton = document.createElement("button");
    prevButton.innerHTML = "&#9664;";
    prevButton.classList.add("prev");

    const navContainer = document.createElement("div");
    navContainer.classList.add("nav-arrows");
    navContainer.appendChild(prevButton);
    navContainer.appendChild(nextButton);
    document.body.appendChild(navContainer);

    function updateSlide(position) {
        slider.style.transform = `translateX(-${position * 100}vw)`;
    }

    nextButton.addEventListener("click", () => {
        if (currentIndex < totalSections - 1) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        updateSlide(currentIndex);
    });

    prevButton.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = totalSections - 1;
        }
        updateSlide(currentIndex);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight") {
            nextButton.click();
        } else if (event.key === "ArrowLeft") {
            prevButton.click();
        }
    });
});

