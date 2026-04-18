/**
 * animations.js
 * GSAP + ScrollTrigger + SplitType animations for MCT College of Legal Studies
 */

(function () {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        console.warn("GSAP or ScrollTrigger not loaded.");
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    /* ─────────────────────────────────────────────
       DYNAMICALLY LOAD SPLIT-TYPE
    ───────────────────────────────────────────── */
    const script = document.createElement("script");
    script.src = "https://unpkg.com/split-type";
    script.onload = initAnimations;
    document.head.appendChild(script);

    function createSplit(target, options) {
        return new SplitType(target, options);
    }

    function initAnimations() {
        const EASE = "power4.out";
        const DURATION = 0.8;

        /* ─────────────────────────────────────────────
           HERO MASTER TIMELINE
        ───────────────────────────────────────────── */
        const heroTl = gsap.timeline({ defaults: { ease: EASE } });

        // Lightweight Session tracking to ensure Hero intro only plays once per visit
        const hasSeenIntro = sessionStorage.getItem("mct_intro_played");

        // 1. Hero Text Elements
        const heroH1 = document.querySelectorAll("header + div h1, header + div h2, .py-20 h1"); // Changed .py-20 to target standard hero classes
        const heroSub = document.querySelectorAll("header + div > div > p:not([style])");
        const heroEyebrow = document.querySelectorAll("header + div p[style*='00BF8E'], header + div > div > p[style*='00BF8E']");

        if (heroEyebrow.length) {
            if (hasSeenIntro) {
                gsap.set(heroEyebrow, { opacity: 1, x: 0 });
            } else {
                gsap.set(heroEyebrow, { opacity: 0, x: -15 });
                heroTl.to(heroEyebrow, { opacity: 1, x: 0, duration: 0.8 }, 0);
            }
        }

        if (heroH1.length) {
            const splitHeroH1 = createSplit(heroH1, { types: "words, chars" });
            if (hasSeenIntro) {
                gsap.set(splitHeroH1.chars, { opacity: 1, y: 0, scale: 1 });
            } else {
                gsap.set(splitHeroH1.chars, { opacity: 0, y: 40, scale: 0.95 });
                heroTl.to(splitHeroH1.chars, {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1.0,
                    stagger: 0.015,
                    ease: "back.out(1.2)"
                }, "-=0.6");
            }
        }

        if (heroSub.length) {
            if (hasSeenIntro) {
                gsap.set(heroSub, { opacity: 1, y: 0 });
            } else {
                gsap.set(heroSub, { opacity: 0, y: 15 });
                heroTl.to(heroSub, {
                    opacity: 1,
                    y: 0,
                    duration: 0.9,
                    ease: "power3.out"
                }, "-=0.6");
            }
        }

        // Mark as played so subsequent pages don't replay the hero drop-ins
        if (!hasSeenIntro) {
            heroTl.eventCallback("onComplete", () => {
                sessionStorage.setItem("mct_intro_played", "true");
            });
        }

        /* ─────────────────────────────────────────────
           SECTION HEADINGS (TYPE 2: 3D Flip) 
        ───────────────────────────────────────────── */
        const sectionH2 = document.querySelectorAll("main h2, section h2");
        sectionH2.forEach((heading) => {
            const splitH2 = createSplit(heading, { types: "words, chars" });

            gsap.set(splitH2.chars, { opacity: 0, y: 30, rotateX: 90, transformOrigin: "0% 50% -20" });

            ScrollTrigger.create({
                trigger: heading,
                start: "top 85%",
                onEnter: () => {
                    gsap.to(splitH2.chars, {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 0.9,
                        stagger: 0.02,
                        ease: "power3.out"
                    });
                },
                once: true
            });
        });

        /* ─────────────────────────────────────────────
           BATCH REVEALS FOR GENERAL ELEMENTS
        ───────────────────────────────────────────── */
        function revealBatch(selector, options = {}) {
            const els = document.querySelectorAll(selector);
            if (!els.length) return;

            gsap.set(els, { opacity: 0, y: options.y ?? 30 });

            // Using pure ScrollTrigger batch ensures they only fire
            // strictly when their target crosses the 'start' threshold
            ScrollTrigger.batch(els, {
                start: "top 85%",
                onEnter(batch) {
                    gsap.to(batch, {
                        opacity: 1,
                        y: 0,
                        duration: options.duration ?? DURATION,
                        ease: options.ease ?? "power3.out",
                        stagger: options.stagger ?? 0.1,
                    });
                },
                once: true,
            });
        }

        // Apply Scroll reveals
        revealBatch("main p:not([style*='00BF8E']):not(.split-type), section p:not([style*='00BF8E']):not(.split-type)", { y: 20, duration: 0.65 });
        revealBatch("main .grid > div, section .grid > div, main .grid > a, section .grid > a", { y: 35, stagger: 0.1 });
        revealBatch("main li, section li", { y: 15, stagger: 0.05 });
        revealBatch("main tr, section tr", { y: 15, stagger: 0.05 });
        revealBatch("aside > div > *, aside nav a, aside nav button", { y: 20, stagger: 0.05 });
        revealBatch("footer .grid > div, footer .grid > ul", { y: 24, stagger: 0.1 });

        /* ─────────────────────────────────────────────
           STATISTICS COUNTER ANIMATION
        ───────────────────────────────────────────── */
        const counters = document.querySelectorAll(".js-counter");
        if (counters.length) {
            counters.forEach((counter) => {
                const targetValue = parseInt(counter.getAttribute("data-target"));

                ScrollTrigger.create({
                    trigger: counter,
                    start: "top 90%",
                    onEnter: () => {
                        gsap.to(counter, {
                            innerText: targetValue,
                            duration: 2,
                            snap: { innerText: 1 },
                            ease: "power2.out",
                            onUpdate: function () {
                                // Add commas and '+' suffix during update
                                const val = parseInt(this.targets()[0].innerText);
                                this.targets()[0].innerText = val.toLocaleString() + "+";
                            }
                        });
                    },
                    once: true
                });
            });
        }
        /* ─────────────────────────────────────────────
           IMAGE & DIVIDER SPECIFIC REVEALS
        ───────────────────────────────────────────── */
        const images = document.querySelectorAll("main img, section img");
        if (images.length) {
            gsap.set(images, { opacity: 0, scale: 0.95 });
            ScrollTrigger.batch(images, {
                start: "top 85%",
                onEnter(batch) {
                    gsap.to(batch, { opacity: 1, scale: 1, duration: 1, ease: EASE, stagger: 0.1 });
                },
                once: true,
            });
        }

        const accentBars = document.querySelectorAll(".w-1.h-6, .w-1.h-5");
        if (accentBars.length) {
            gsap.set(accentBars, { scaleY: 0, transformOrigin: "top center" });
            ScrollTrigger.batch(accentBars, {
                start: "top 85%",
                onEnter(batch) {
                    gsap.to(batch, { scaleY: 1, duration: 0.45, ease: "power2.out", stagger: 0.08 });
                },
                once: true,
            });
        }
    }

    window.addEventListener("load", function () {
        if (typeof ScrollTrigger !== "undefined") {
            ScrollTrigger.refresh();
        }
    });

})();
