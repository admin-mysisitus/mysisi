document.addEventListener("DOMContentLoaded", () => {
    const promoCard = document.getElementById("promoFloatCard");
    const closeBtn = document.getElementById("promoCloseBtn");

    if (promoCard && closeBtn) {
        // Check if user has already dismissed the promo card
        const isDismissed = localStorage.getItem("alwahyu_promo_dismissed");
        
        if (!isDismissed) {
            // Show the promo card after 2 seconds
            setTimeout(() => {
                promoCard.classList.add("show");
            }, 2000);
        }

        // Close the promo card
        closeBtn.addEventListener("click", () => {
            promoCard.classList.remove("show");
            // Persist the dismissed state in localStorage
            localStorage.setItem("alwahyu_promo_dismissed", "true");
        });
    }
});
