// Vertical Editor Onboarding
(function () {
    const HAS_SEEN_VERTICAL_KEY = "hasSeenVerticalOnboarding";

    const dialogueSample =
`Tom: Hi, how's everyone today?
Mary: I am doing fantastic!
David: What are we talking about today?
Mary: What about ice cream?
Tom: Yeah, everyone likes ice cream.`;

    // Hook onto the Vertical mode button — fires the first time only
    window.addEventListener("load", () => {
        const vertBtn = document.getElementById("modeVerticalBtn");
        if (!vertBtn) return;

        vertBtn.addEventListener("click", () => {
            if (localStorage.getItem(HAS_SEEN_VERTICAL_KEY) === "true") return;
            // Small delay so the editor has time to appear in the DOM
            setTimeout(initTutorial, 400);
        });
    });

    // ─── State ────────────────────────────────────────────────────────────────
    let overlay, tooltip, stepIndex = 0;
    let targetElement = null;

    const steps = [
        // 0 ── Welcome
        {
            title: "Vertical Mode 📋",
            text: "This mode is for text that <strong>already alternates line by line</strong> — like a bilingual transcript, a dialogue, or anything with speaker names.<br><br>Let's do a quick 30-second tour!",
            target: null,
            action: "Let's go!"
        },

        // 1 ── Auto-detect speakers (before pasting, so it's on when they paste)
        {
            title: "Step 1: Auto-detect Speakers 🎭",
            text: "When your text has speaker names like <code style='background:rgba(0,0,0,0.1); padding:1px 4px; border-radius:3px;'>Tom: ...</code>, this checkbox automatically groups each speaker onto the same voice track.<br><br>👉 <strong>Make sure it's turned ON</strong> — then we'll paste some text and you'll see it in action!",
            target: "#verticalAutoDetectChk",
            action: "It's on! ✓",
            onShow: () => {
                const chk = document.getElementById("verticalAutoDetectChk");
                if (chk && !chk.checked) chk.checked = true;
            }
        },

        // 2 ── Paste sample
        {
            title: "Step 2: Paste some dialogue ✍️",
            text: `Copy this sample and <strong>paste it into the editor</strong> below — watch how Tom, Mary and David each get grouped to their own track automatically:<br><br>
<div style="font-size:0.82em; background:rgba(0,0,0,0.08); padding:8px; border-radius:4px; max-height:100px; overflow-y:auto; margin-bottom:10px; border:1px solid var(--accent); color:inherit; white-space:pre-wrap;">${dialogueSample}</div>
<button id="vCopyBtn" style="padding:4px 10px; cursor:pointer; border-radius:4px; font-weight:bold; border:1px solid var(--accent); background:var(--accent); color:var(--bg-color);">Copy Text</button>`,
            target: "#verticalEditor",
            action: "I pasted it! ✓",
            onShow: () => {
                const btn = document.getElementById("vCopyBtn");
                if (btn) btn.onclick = () => {
                    navigator.clipboard.writeText(dialogueSample);
                    btn.textContent = "Copied!";
                };
            }
        },

        // 3 ── Default Pattern
        {
            title: "Step 3: Default Pattern 🔀",

            text: "No speaker names in your text? No problem — <strong>Default Pattern</strong> handles that.<br><br>It assigns each line to a voice track in order. For example, <em>Alternating V1, V2</em> means: line 1 → Voice 1, line 2 → Voice 2, line 3 → Voice 1, and so on.<br><br>Perfect for bilingual books where it's just:<br><em>English line… Spanish line… English line…</em>",
            target: "#verticalPatternSelect",
            action: "Makes sense!"
        },

        // 4 ── Done
        {
            title: "You're all set! 🎉",
            text: "That's all there is to it. Assign voices to your tracks up top, then hit <strong>Play</strong> and the voices will switch automatically.<br><br>Happy listening!",
            target: "#playBtn",
            action: "▶ Let's Play!",
            onShow: () => {
                const btn = document.getElementById("playBtn");
                if (btn) btn.classList.add("pulse-highlight");
            }
        }
    ];

    // ─── Init ─────────────────────────────────────────────────────────────────
    function initTutorial() {
        if (!document.getElementById("verticalOnboardingStyles")) {
            const style = document.createElement("style");
            style.id = "verticalOnboardingStyles";
            style.innerHTML = `
                .v-onboarding-overlay {
                    position: fixed;
                    top: 0; left: 0; width: 100vw; height: 100vh;
                    background: rgba(0, 0, 0, 0.6);
                    z-index: 9999;
                    pointer-events: none;
                    transition: opacity 0.3s;
                }
                .v-onboarding-tooltip {
                    position: absolute;
                    background: var(--card-bg, #fff);
                    color: var(--text-color, #333);
                    padding: 20px;
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    z-index: 1000000;
                    max-width: 360px;
                    pointer-events: auto;
                    border: 2px solid var(--accent, #b05a2f);
                    transition: top 0.3s, left 0.3s;
                }
                .v-onboarding-tooltip h3 {
                    margin-top: 0; margin-bottom: 10px;
                    color: var(--accent, #b05a2f);
                }
                .v-onboarding-tooltip p {
                    margin-bottom: 15px;
                    font-size: 0.95em;
                    line-height: 1.5;
                }
                .v-onboarding-tooltip .nav-btn {
                    background: var(--accent, #b05a2f);
                    color: var(--bg-color, #fff);
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    float: right;
                }
                .v-onboarding-tooltip .skip-btn {
                    background: transparent;
                    color: gray;
                    border: none;
                    padding: 8px;
                    cursor: pointer;
                    float: left;
                    font-size: 0.9em;
                }
                .v-onboarding-highlight {
                    position: relative;
                    z-index: 10001 !important;
                    box-shadow: 0 0 0 4px var(--accent, #b05a2f), 0 0 0 9999px rgba(0,0,0,0.6) !important;
                    border-radius: 6px;
                    pointer-events: auto;
                }
                .pulse-highlight {
                    animation: pulse-ring 1.5s infinite;
                }
                @keyframes pulse-ring {
                    0%   { box-shadow: 0 0 0 0   rgba(176, 90, 47, 0.7); }
                    70%  { box-shadow: 0 0 0 10px rgba(176, 90, 47, 0);   }
                    100% { box-shadow: 0 0 0 0   rgba(176, 90, 47, 0);   }
                }
            `;
            document.head.appendChild(style);
        }

        overlay = document.createElement("div");
        overlay.className = "v-onboarding-overlay";
        document.body.appendChild(overlay);

        tooltip = document.createElement("div");
        tooltip.className = "v-onboarding-tooltip";
        document.body.appendChild(tooltip);

        window.addEventListener("resize", updateTooltipPosition);

        stepIndex = 0;
        renderStep();
    }

    // ─── Render ───────────────────────────────────────────────────────────────
    function renderStep() {
        const step = steps[stepIndex];

        // Clear previous highlights
        document.querySelectorAll(".v-onboarding-highlight").forEach(el =>
            el.classList.remove("v-onboarding-highlight")
        );

        if (step.target) {
            targetElement = document.querySelector(step.target);
            if (targetElement) {
                targetElement.classList.add("v-onboarding-highlight");
                // Use box-shadow spotlight — hide flat overlay
                overlay.style.display = "none";
                // Scroll target into view smoothly
                targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        } else {
            targetElement = null;
            overlay.style.display = "block";
        }

        tooltip.innerHTML = `
            <h3>${step.title}</h3>
            <p>${step.text}</p>
            <button class="skip-btn" onclick="window.finishVerticalOnboarding()">Skip</button>
            <button class="nav-btn" onclick="window.nextVerticalOnboardingStep()">${step.action}</button>
            <div style="clear:both;"></div>
        `;

        updateTooltipPosition();
        if (step.onShow) step.onShow();
    }

    // ─── Positioning ──────────────────────────────────────────────────────────
    function updateTooltipPosition() {
        if (!targetElement) {
            tooltip.style.top       = "50%";
            tooltip.style.left      = "50%";
            tooltip.style.transform = "translate(-50%, -50%)";
            return;
        }

        tooltip.style.transform = "none";
        const rect        = targetElement.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        // Default: below the target
        let top  = rect.bottom + 15;
        let left = rect.left;

        // For small inline elements (checkbox, select), pop tooltip to the right
        if (rect.width < 300) {
            top  = rect.top;
            left = rect.right + 20;
        }

        // Clamp to viewport
        if (top + tooltipRect.height > window.innerHeight - 10) {
            top = Math.max(10, rect.top - tooltipRect.height - 15);
        }
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = Math.max(10, window.innerWidth - tooltipRect.width - 15);
        }
        if (top < 10) top = 10;

        tooltip.style.top  = top  + "px";
        tooltip.style.left = Math.max(10, left) + "px";
    }

    // ─── Navigation ───────────────────────────────────────────────────────────
    window.nextVerticalOnboardingStep = () => {
        stepIndex++;
        if (stepIndex >= steps.length) {
            window.finishVerticalOnboarding();
        } else {
            renderStep();
        }
    };

    window.finishVerticalOnboarding = () => {
        document.querySelectorAll(".v-onboarding-highlight").forEach(el =>
            el.classList.remove("v-onboarding-highlight")
        );
        const playBtn = document.getElementById("playBtn");
        if (playBtn) playBtn.classList.remove("pulse-highlight");

        if (overlay)  overlay.remove();
        if (tooltip)  tooltip.remove();

        window.removeEventListener("resize", updateTooltipPosition);

        localStorage.setItem(HAS_SEEN_VERTICAL_KEY, "true");
    };

})();
