const pageLinks = document.querySelectorAll("a");

pageLinks.forEach(link => {
    link.addEventListener("click", event => {
        const href = link.getAttribute("href");
        const target = link.getAttribute("target");

        if (
            href &&
            !href.startsWith("#") &&
            !href.startsWith("http") &&
            !href.endsWith(".pdf") &&
            target !== "_blank"
        ) {
            event.preventDefault();
            document.body.classList.add("fade-out");

            setTimeout(() => {
                window.location.href = href;
            }, 260);
        }
    });
});

document.querySelectorAll(".project-card, .portfolio-gallery-card").forEach(card => {
    const gallery = card.querySelector(".gallery-track");
    const dots = card.querySelector(".dots");
    const previousButton = card.querySelector(".prev");
    const nextButton = card.querySelector(".next");

    if (!gallery || !dots) return;

    const images = (gallery.dataset.images || "")
        .split("|")
        .map(image => image.trim())
        .filter(Boolean);

    if (!images.length) return;

    let activeIndex = 0;
    let startX = 0;

    images.forEach((image, index) => {
        const slide = document.createElement("figure");
        slide.className = "gallery-slide";

        const img = document.createElement("img");
        img.src = image;
        const title = card.querySelector("h3, .portfolio-gallery-header span")?.textContent.trim() || "Gallery";
        img.alt = `${title} preview ${index + 1}`;
        img.loading = index === 0 ? "eager" : "lazy";

        slide.appendChild(img);
        gallery.appendChild(slide);

        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Show image ${index + 1}`);
        dot.addEventListener("click", () => showSlide(index));
        dots.appendChild(dot);
    });

    const dotButtons = dots.querySelectorAll("button");
    const slides = gallery.querySelectorAll(".gallery-slide");

    function showSlide(index) {
        activeIndex = (index + images.length) % images.length;

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("active", slideIndex === activeIndex);
            slide.classList.toggle("previous", slideIndex === (activeIndex - 1 + images.length) % images.length);
        });

        dotButtons.forEach((dot, dotIndex) => {
            dot.classList.toggle("active", dotIndex === activeIndex);
        });
    }

    previousButton?.addEventListener("click", () => showSlide(activeIndex - 1));
    nextButton?.addEventListener("click", () => showSlide(activeIndex + 1));

    gallery.addEventListener("touchstart", event => {
        startX = event.touches[0].clientX;
    }, { passive: true });

    gallery.addEventListener("touchend", event => {
        const endX = event.changedTouches[0].clientX;
        const distance = endX - startX;

        if (Math.abs(distance) > 45) {
            showSlide(activeIndex + (distance < 0 ? 1 : -1));
        }
    });

    if (images.length < 2) {
        previousButton?.setAttribute("hidden", "");
        nextButton?.setAttribute("hidden", "");
        dots.setAttribute("hidden", "");
    }

    showSlide(0);
});

const pdfModal = document.getElementById("pdfModal");
const pdfTitle = document.getElementById("pdfTitle");
const pdfFrame = document.getElementById("pdfFrame");
const pdfStatus = document.getElementById("pdfStatus");
const pdfFallback = document.getElementById("pdfFallback");
const pdfOpenLink = document.querySelector("#pdfModal .pdf-open-link");
const portfolioModal = document.getElementById("portfolioModal");
const portfolioDownload = document.querySelector(".portfolio-download");
let pdfTimer;

function openPortfolioModal(pdf) {
    if (!portfolioModal) {
        window.open(pdf, "_blank", "noopener");
        return;
    }

    if (portfolioDownload && pdf) {
        portfolioDownload.href = pdf;
    }

    portfolioModal.classList.add("is-open");
    portfolioModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
}

function closePortfolioModal() {
    if (!portfolioModal) return;

    portfolioModal.classList.remove("is-open");
    portfolioModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
}

function openPdfModal({ title, pdf, mode }) {
    if (mode === "portfolio-gallery") {
        openPortfolioModal(pdf);
        return;
    }

    if (mode === "new-tab") {
        const openedWindow = window.open(pdf, "_blank");

        if (openedWindow) {
            openedWindow.opener = null;
            return;
        }

        window.location.href = pdf;
        return;
    }

    if (!pdfModal || !pdfTitle || !pdfFrame || !pdfStatus || !pdfFallback || !pdfOpenLink) {
        window.open(pdf, "_blank", "noopener");
        return;
    }

    clearTimeout(pdfTimer);
    pdfTitle.textContent = title;
    pdfOpenLink.href = pdf;
    pdfFallback.querySelector("a").href = pdf;
    pdfStatus.classList.remove("is-hidden");
    pdfFallback.classList.remove("is-visible");
    pdfFrame.classList.remove("is-ready");
    pdfFrame.removeAttribute("src");
    pdfModal.classList.add("is-open");
    pdfModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    pdfStatus.querySelector("p").textContent = "Preparing document preview...";
    pdfFrame.src = pdf;

    pdfTimer = setTimeout(() => {
        if (!pdfFrame.classList.contains("is-ready")) {
            pdfFallback.classList.add("is-visible");
        }
    }, 4500);
}

function closePdfModal() {
    if (!pdfModal || !pdfFrame || !pdfStatus) return;

    clearTimeout(pdfTimer);
    pdfModal.classList.remove("is-open");
    pdfModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    pdfStatus.classList.remove("is-hidden");

    setTimeout(() => {
        pdfFrame.removeAttribute("src");
        pdfFrame.classList.remove("is-ready");
    }, 250);
}

document.querySelectorAll(".document-trigger").forEach(button => {
    button.addEventListener("click", () => {
        openPdfModal({
            title: button.dataset.title || "Document",
            pdf: button.dataset.pdf,
            mode: button.dataset.mode || "embed"
        });
    });
});

pdfFrame?.addEventListener("load", () => {
    clearTimeout(pdfTimer);
    pdfStatus?.classList.add("is-hidden");
    pdfFrame.classList.add("is-ready");
});

document.querySelectorAll("[data-close-pdf]").forEach(button => {
    button.addEventListener("click", closePdfModal);
});

document.querySelectorAll("[data-close-portfolio]").forEach(button => {
    button.addEventListener("click", closePortfolioModal);
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && pdfModal?.classList.contains("is-open")) {
        closePdfModal();
    }

    if (event.key === "Escape" && portfolioModal?.classList.contains("is-open")) {
        closePortfolioModal();
    }
});

