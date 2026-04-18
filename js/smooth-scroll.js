/**
 * smooth-scroll.js
 * Lenis smooth scroll — Framer-style inertia scrolling.
 * Uses requestAnimationFrame directly to avoid GSAP ticker conflicts
 * that can cause scroll blocking on some pages.
 */

(function () {
    if (typeof Lenis === "undefined") {
        console.warn("Lenis not loaded.");
        return;
    }

    /* ─────────────────────────────────────────────
       INIT LENIS
    ───────────────────────────────────────────── */
    var lenis = new Lenis({
        duration: 0.75, // Lower duration makes it faster
        easing: function (t) {
            // Cubic ease out — smooth and reliable
            return 1 - Math.pow(1 - t, 3);
        },
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1.1, // Slightly larger chunks
        touchMultiplier: 2,
        infinite: false,
        autoRaf: false, // We manually call raf
    });

    /* ─────────────────────────────────────────────
       RAF LOOP — use rAF directly, not GSAP ticker
       This is the most stable pattern for Lenis.
    ───────────────────────────────────────────── */
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    /* ─────────────────────────────────────────────
       SCROLLTRIGGER INTEGRATION
       Tell ScrollTrigger to use Lenis scroll position.
    ───────────────────────────────────────────── */
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        lenis.on("scroll", function () {
            ScrollTrigger.update();
        });

        // Proxy ScrollTrigger to read Lenis scrollTop
        ScrollTrigger.scrollerProxy(document.body, {
            scrollTop: function (value) {
                if (arguments.length) {
                    lenis.scrollTo(value, { immediate: true });
                }
                return lenis.scroll;
            },
            getBoundingClientRect: function () {
                return {
                    top: 0,
                    left: 0,
                    width: window.innerWidth,
                    height: window.innerHeight,
                };
            },
            pinType: document.body.style.transform ? "transform" : "fixed",
        });

        ScrollTrigger.addEventListener("refresh", function () {
            lenis.resize();
        });

        ScrollTrigger.refresh();
    }

    /* ─────────────────────────────────────────────
       EXPOSE GLOBALLY
    ───────────────────────────────────────────── */
    window.lenis = lenis;

    /* ─────────────────────────────────────────────
       SMOOTH ANCHOR SCROLLING
    ───────────────────────────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener("click", function (e) {
            var href = anchor.getAttribute("href");
            if (href === "#") return;
            var target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                lenis.scrollTo(target, { offset: -80, duration: 1.2 });
            }
        });
    });

    /* ─────────────────────────────────────────────
       NOTIFY OTHER SCRIPTS
    ───────────────────────────────────────────── */
    window.dispatchEvent(new Event("lenisReady"));
})();
