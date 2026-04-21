// Reader Superpower Tour
(function() {
    const HAS_SEEN_READER_TUTORIAL_KEY = "hasSeenReaderOnboarding";

    window.triggerReaderOnboarding = function() {
        if (localStorage.getItem(HAS_SEEN_READER_TUTORIAL_KEY) === "true") {
            return;
        }

        let overlay, tooltip, stepIndex = 0;
        let targetElement = null;

        const steps = [
            {
                title: "Auto switch voices (up to 3)",
                text: "The voices automatically switch languages/accents of your choice.<br><br>Let's take a quick look at some tools.",
                target: null,
                action: "Show Me"
            },
            {
                title: "Tool 1: Track Controls 🎛️",
                text: "Use the 👁️ icon to <strong>hide the text</strong> for any track.<br><br>Use the 🎧 icon to <strong>mute a voice</strong>.<br><br><em>(These live inside ⚙ Playback Options — we've opened it for you!)</em>",
                target: "#showAudioGrid",
                action: "Next",
                onShow: () => {
                    // Make sure the Playback Options panel is open so the grid is visible
                    const panel = document.getElementById("playbackOptions");
                    const arrow = document.getElementById("playbackArrow");
                    const btn   = document.getElementById("playbackToggleBtn");
                    if (panel && panel.style.display === "none") {
                        panel.style.display = "block";
                        if (arrow) arrow.textContent = "▴";
                        if (btn) { btn.style.borderColor = "var(--accent)"; btn.style.color = "var(--accent)"; }
                    }
                    // Highlight both the toggle button and the grid inside it
                    const grid = document.getElementById("showAudioGrid");
                    const toggleBtn = document.getElementById("playbackToggleBtn");
                    if (grid) {
                        overlay.style.display = "block";
                        targetElement = grid;
                        targetElement.classList.add("onboarding-highlight-overlay");
                    }
                    if (toggleBtn) {
                        toggleBtn.classList.add("onboarding-highlight-overlay");
                    }
                }
            },
            {
                title: "Tool 2: The Loop 🔁",
                text: "Click this to **loop the current sentence** indefinitely.<br><br>*(Shortcut: L)*",
                target: "#loopBtn",
                action: "Next",
            },
            {
                title: "Tool 3: Click to Hear 🗣️",
                text: "Left-click any word in the text to hear it spoken instantly.",
                target: ".word",
                action: "Next",
                onShow: () => {
                    const words = Array.from(document.querySelectorAll(".word")).filter(el => !el.textContent.includes('➕') && !el.textContent.includes('✔️'));
                    if(words.length > 0) {
                        targetElement = words[0];
                        targetElement.classList.add("onboarding-highlight", "pulse-highlight");
                    }
                }
            },
            {
                title: "Tool 4: Right-Click to Save 💾",
                text: "**Right-Click** any word to instantly send it to your Vocabulary Notebook below for flashcards.",
                target: ".word",
                action: "Next",
                onShow: () => {
                    const words = Array.from(document.querySelectorAll(".word")).filter(el => !el.textContent.includes('➕') && !el.textContent.includes('✔️'));
                    if(words.length > 0) {
                        targetElement = words[0];
                        targetElement.classList.add("onboarding-highlight", "pulse-highlight");
                    }
                }
            },
            {
                title: "Shortcuts ⌨️",
                text: "There are more shortcuts (like Space to Pause, Arrow keys to skip sentences). Check out the Shortcuts list down below!<br><br>That's it! You're ready to go. Click Play to continue.",
                target: "button[onclick*='helpModal']",
                action: "Finish Tour",
                onShow: () => {
                    const helpBtn = document.querySelector("button[onclick*='helpModal']");
                    if (helpBtn) {
                        targetElement = helpBtn;
                        targetElement.classList.add("onboarding-highlight", "pulse-highlight");
                    }
                }
            }
        ];

        function initTutorial() {
            // Re-use or append CSS
            if(!document.getElementById("readerOnboardingStyles")) {
                const style = document.createElement("style");
                style.id = "readerOnboardingStyles";
                style.innerHTML = `
                    .reader-onboarding-overlay {
                        position: fixed;
                        top: 0; left: 0; width: 100vw; height: 100vh;
                        background: rgba(0, 0, 0, 0.6);
                        z-index: 9999;
                        pointer-events: none; 
                        transition: opacity 0.3s;
                    }
                    .reader-onboarding-tooltip {
                        position: absolute;
                        background: var(--card-bg, #fff);
                        color: var(--text-color, #333);
                        padding: 20px;
                        border-radius: 12px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                        z-index: 1000000;
                        max-width: 350px;
                        pointer-events: auto;
                        border: 2px solid var(--accent, #b05a2f);
                        transition: top 0.3s, left 0.3s;
                    }
                    .reader-onboarding-tooltip h3 { margin-top: 0; margin-bottom: 10px; color: var(--accent, #b05a2f); }
                    .reader-onboarding-tooltip p { margin-bottom: 15px; font-size: 0.95em; line-height: 1.4; }
                    .reader-onboarding-tooltip .nav-btn {
                        background: var(--accent, #b05a2f);
                        color: var(--bg-color, #fff);
                        border: none;
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: bold;
                        float: right;
                    }
                    .reader-onboarding-tooltip .skip-btn {
                        background: transparent;
                        color: gray;
                        border: none;
                        padding: 8px;
                        cursor: pointer;
                        float: left;
                        font-size: 0.9em;
                    }
                    .onboarding-highlight {
                        position: relative;
                        z-index: 10001 !important;
                        box-shadow: 0 0 0 4px var(--accent, #b05a2f), 0 0 0 9999px rgba(0,0,0,0.6) !important;
                        border-radius: 4px;
                        pointer-events: auto;
                    }
                    .onboarding-highlight-overlay {
                        position: relative;
                        z-index: 10001 !important;
                        box-shadow: 0 0 0 4px var(--accent, #b05a2f) !important;
                        border-radius: 6px;
                        pointer-events: auto;
                        background: var(--card-bg, #fff);
                        padding: 4px;
                    }
                    .pulse-highlight {
                        animation: pulse-ring 1.5s infinite;
                    }
                `;
                document.head.appendChild(style);
            }

            overlay = document.createElement("div");
            overlay.className = "reader-onboarding-overlay";
            document.body.appendChild(overlay);

            tooltip = document.createElement("div");
            tooltip.className = "reader-onboarding-tooltip";
            document.body.appendChild(tooltip);

            window.addEventListener("resize", updateTooltipPosition);
            
            renderStep();
        }

        function renderStep() {
            const step = steps[stepIndex];
            
            document.querySelectorAll('.onboarding-highlight, .onboarding-highlight-overlay').forEach(el => el.classList.remove('onboarding-highlight', 'onboarding-highlight-overlay', 'pulse-highlight'));
            
            if (step.target) {
                // onShow might have already set targetElement
                if (!step.onShow) {
                    targetElement = document.querySelector(step.target);
                    if (targetElement) targetElement.classList.add("onboarding-highlight");
                }
                overlay.style.display = 'none';
            } else {
                targetElement = null;
                overlay.style.display = 'block'; 
            }

            tooltip.innerHTML = `
                <h3>${step.title}</h3>
                <p>${step.text}</p>
                <button class="skip-btn" onclick="window.finishReaderOnboarding()">Skip</button>
                <button class="nav-btn" onclick="window.nextReaderOnboardingStep()">${step.action}</button>
                <div style="clear:both;"></div>
            `;

            updateTooltipPosition();
            if (step.onShow) step.onShow();
        }

        function updateTooltipPosition() {
            if (!targetElement) {
                tooltip.style.top = "50%";
                tooltip.style.left = "50%";
                tooltip.style.transform = "translate(-50%, -50%)";
                return;
            }

            tooltip.style.transform = "none";
            const rect = targetElement.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            let top = rect.bottom + 15;
            let left = rect.left;

            if (top + tooltipRect.height > window.innerHeight) {
                top = Math.max(10, rect.top - tooltipRect.height - 15);
            }
            if (left + tooltipRect.width > window.innerWidth) {
                left = Math.max(10, window.innerWidth - tooltipRect.width - 15);
            }

            tooltip.style.top = top + "px";
            tooltip.style.left = Math.max(10, left) + "px";
        }

        window.nextReaderOnboardingStep = () => {
            stepIndex++;
            if (stepIndex >= steps.length) {
                window.finishReaderOnboarding();
            } else {
                renderStep();
            }
        };

        window.finishReaderOnboarding = () => {
            document.querySelectorAll('.onboarding-highlight, .onboarding-highlight-overlay').forEach(el => el.classList.remove('onboarding-highlight', 'onboarding-highlight-overlay', 'pulse-highlight'));
            if(overlay) overlay.remove();
            if(tooltip) tooltip.remove();
            
            localStorage.setItem(HAS_SEEN_READER_TUTORIAL_KEY, "true");
            
            // Trigger Play to continue safely
            const playBtn = document.getElementById("playBtn");
            if (playBtn) {
                playBtn.click();
            }
        };

        // Start it up
        initTutorial();
    };

})();