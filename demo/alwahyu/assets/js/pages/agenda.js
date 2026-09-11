document.addEventListener("DOMContentLoaded", function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const rows = document.querySelectorAll(".agenda-row");
    let visibleCount = 0;
    
    rows.forEach(row => {
        const dateStr = row.getAttribute("data-date");
        if (dateStr) {
            const eventDate = new Date(dateStr);
            eventDate.setHours(0, 0, 0, 0);
            
            if (eventDate < today) {
                row.style.display = 'none';
            } else {
                visibleCount++;
            }
        }
    });
    
    if (visibleCount === 0) {
        const body = document.querySelector(".agenda-body");
        const headerRow = document.querySelector(".agenda-row-header");
        if (headerRow) headerRow.style.display = 'none';
        
        const emptyState = document.createElement("div");
        emptyState.className = "agenda-empty-state";
        emptyState.innerHTML = `
            <i class="ph ph-calendar-x" class="js-empty-icon"></i>
            <p class="js-empty-text">Belum ada agenda terdekat dalam waktu dekat.</p>
        `;
        emptyState.style.padding = "60px 20px";
        body.appendChild(emptyState);
    }
});