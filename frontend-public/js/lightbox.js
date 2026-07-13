// Shared lightbox: enlarges <img> elements and the background images
// of the featured sections (hero, living room, showroom) on click.
(() => {
    const style = document.createElement("style");
    style.textContent = `
        img,
        .lightbox-zoomable {
            cursor: zoom-in;
        }
        .lightbox-overlay {
            position: fixed;
            inset: 0;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4vmin;
            background: rgba(27, 22, 18, 0.88);
            opacity: 0;
            transition: opacity 0.25s ease;
            cursor: zoom-out;
        }
        .lightbox-overlay.visible {
            opacity: 1;
        }
        .lightbox-img {
            max-width: 100%;
            max-height: 100%;
            border-radius: 10px;
            box-shadow: 0 24px 70px rgba(0, 0, 0, 0.5);
            cursor: zoom-out;
        }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    const bigImg = document.createElement("img");
    bigImg.className = "lightbox-img";
    bigImg.alt = "";
    overlay.appendChild(bigImg);

    function open(src, alt) {
        bigImg.src = src;
        bigImg.alt = alt || "";
        document.body.appendChild(overlay);
        document.body.style.overflow = "hidden";
        requestAnimationFrame(() => overlay.classList.add("visible"));
    }

    function close() {
        overlay.classList.remove("visible");
        document.body.style.overflow = "";
        overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
    }

    overlay.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay.isConnected) close();
    });

    function backgroundUrl(el) {
        const match = getComputedStyle(el).backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
        return match ? match[1] : null;
    }

    document.addEventListener("click", (e) => {
        if (overlay.contains(e.target)) return;

        const img = e.target.closest("img");
        if (img) {
            open(img.src, img.alt);
            return;
        }

        if (e.target.closest("a, button")) return;

        const section = e.target.closest(".hero, .feature-section");
        if (section) {
            const url = backgroundUrl(section);
            if (url) open(url);
        }
    });

    document.querySelectorAll(".hero, .feature-section").forEach((el) => {
        el.classList.add("lightbox-zoomable");
    });
})();
