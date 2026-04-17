// CodeSwitchReader Onboarding Tutorial
(function() {
    const HAS_SEEN_TUTORIAL_KEY = "hasSeenOnboarding";
    
    // Only show once
    if (localStorage.getItem(HAS_SEEN_TUTORIAL_KEY) === "true") {
        return;
    }

    const englishSample = `Sam wanted one thing. He wanted to be strong.

And he didn’t just want to be strong—he wanted to be the strongest. Stronger than everyone he knew. He thought about it all day. In the morning, at night, even before sleep. He wanted to be number one.

Every day was the same for Sam. He woke up early and ate the same food—eggs, chicken, and rice. No change.

Then he went to the gym.`;

    const spanishSample = `Sam solo quería una cosa-quería ser el más fuerte.

Y no solo quería ser fuerte, sino el más fuerte. Más fuerte que todos los que conocía. No dejaba de pensar en ello en todo momento. Por la mañana, por la noche, incluso antes de dormir. Quería ser el número uno.

Cada día era igual para Sam. Se levantaba temprano y comía lo mismo: huevos, pollo y arroz. Sin cambios.

Luego se iba al gimnasio.`;

    // Wait for the app to fully load
    window.addEventListener("load", () => {
        setTimeout(initTutorial, 1500); // give it a moment
    });

    let overlay, tooltip, stepIndex = 0;
    let targetElement = null;

    const steps = [
        {
            title: "Welcome to CodeSwitchReader! 🎉",
            text: "Let's do a quick 1-minute setup so you can see how this works. Ready?",
            target: null,
            action: "Start Tutorial"
        },
        {
            title: "Step 1: Pick the Main Voice 🗣️",
            text: "Click here to select an **English** voice for the main text.",
            target: "#wrap1",
            action: "Next",
            onShow: () => { 
                const v1 = document.getElementById("voice1");
                if(v1) v1.focus(); 
            }
        },
        {
            title: "Step 2: Pick the Second Voice 🗣️",
            text: "Now, select a **Spanish** voice for the translation track.",
            target: "#wrap2",
            action: "Next",
            onShow: () => { 
                const v2 = document.getElementById("voice2");
                if(v2) v2.focus(); 
            }
        },
        {
            title: "Step 3: Add English Text 🇺🇸",
            text: `Copy this English text and paste it directly into the **first column** and see how it chops it up:<br><br>
            <div style="font-size:0.8em; background:rgba(0,0,0,0.1); padding:8px; border-radius:4px; max-height: 80px; overflow-y:auto; margin-bottom:10px; border:1px solid #ccc; color:inherit;">${englishSample.replace(/\n/g, '<br>')}</div>
            <button id="copyEnBtn" style="padding:4px 8px; cursor:pointer; border-radius:4px; font-weight:bold; border:1px solid var(--accent); background:var(--accent); color:var(--bg-color);">Copy English Text</button>`,
            target: "#gridEditor .grid-row:first-child .cell-wrapper:nth-child(1) .grid-cell",
            action: "Next",
            onShow: () => {
                const copyBtn = document.getElementById("copyEnBtn");
                if (copyBtn) copyBtn.onclick = () => { navigator.clipboard.writeText(englishSample); copyBtn.textContent = "Copied!"; };
            }
        },
        {
            title: "Step 4: Add Spanish translation of the same story 🇪🇸",
            text: `Copy this Spanish text and paste it into the first block of the **second column** and see how they algin automatically:<br><br>
            <div style="font-size:0.8em; background:rgba(0,0,0,0.1); padding:8px; border-radius:4px; max-height: 80px; overflow-y:auto; margin-bottom:10px; border:1px solid #ccc; color:inherit;">${spanishSample.replace(/\n/g, '<br>')}</div>
            <button id="copyEsBtn" style="padding:4px 8px; cursor:pointer; border-radius:4px; font-weight:bold; border:1px solid var(--accent); background:var(--accent); color:var(--bg-color);">Copy Spanish Text</button>`,
            target: "#gridEditor .grid-row:first-child .cell-wrapper:nth-child(2) .grid-cell",
            action: "Next",
            onShow: () => {
                const copyBtn = document.getElementById("copyEsBtn");
                if (copyBtn) copyBtn.onclick = () => { navigator.clipboard.writeText(spanishSample); copyBtn.textContent = "Copied!"; };
            }
        },
        {
            title: "Step 5: Adjust Speed ⚡",
            text: "Each voice has its own independent speed slider! You can set your English fast and your Spanish slow. Adjust them here if you want.",
            target: ".mini-speed-row",
            position: "above",
            action: "Next",
            onShow: () => {
                const rateSlider = document.getElementById("rate1");
                if (rateSlider) rateSlider.focus();
            }
        },
        {
            title: "Step 6: Play! ▶️",
            text: "You're all set! Click the **Play** button to hear the magic happen. The app will smoothly switch between the two voices.",
            target: "#playBtn",
            action: "Finish Setup",
            onShow: () => { 
                const btn = document.getElementById("playBtn");
                if(btn) btn.classList.add("pulse-highlight"); 
            }
        }
    ];

    function initTutorial() {
        // Create CSS
        const style = document.createElement("style");
        style.innerHTML = `
            .onboarding-overlay {
                position: fixed;
                top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(0, 0, 0, 0.6);
                z-index: 9999;
                pointer-events: none; /* Let clicks pass through except for the tooltip */
                transition: opacity 0.3s;
            }
            .onboarding-tooltip {
                position: absolute;
                background: var(--card-bg, #fff);
                color: var(--text-color, #333);
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 1000000; /* Super high to float above the dropdowns and shadows */
                max-width: 350px;
                pointer-events: auto; /* Catch clicks */
                border: 2px solid var(--accent, #b05a2f);
                transition: top 0.3s, left 0.3s;
            }
            .onboarding-tooltip h3 { margin-top: 0; margin-bottom: 10px; color: var(--accent, #b05a2f); }
            .onboarding-tooltip p { margin-bottom: 15px; font-size: 0.95em; line-height: 1.4; }
            .onboarding-tooltip .nav-btn {
                background: var(--accent, #b05a2f);
                color: var(--bg-color, #fff);
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                float: right;
            }
            .onboarding-tooltip .skip-btn {
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
            .pulse-highlight {
                animation: pulse-ring 1.5s infinite;
            }
            @keyframes pulse-ring {
                0% { box-shadow: 0 0 0 0 rgba(176, 90, 47, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(176, 90, 47, 0); }
                100% { box-shadow: 0 0 0 0 rgba(176, 90, 47, 0); }
            }
        `;
        document.head.appendChild(style);

        // Create overlay and tooltip
        overlay = document.createElement("div");
        overlay.className = "onboarding-overlay";
        document.body.appendChild(overlay);

        tooltip = document.createElement("div");
        tooltip.className = "onboarding-tooltip";
        document.body.appendChild(tooltip);

        window.addEventListener("resize", updateTooltipPosition);
        
        renderStep();
    }

    function renderStep() {
        const step = steps[stepIndex];
        
        // Remove previous highlights
        document.querySelectorAll('.onboarding-highlight').forEach(el => el.classList.remove('onboarding-highlight'));
        
        if (step.target) {
            targetElement = document.querySelector(step.target);
            if (targetElement) {
                targetElement.classList.add("onboarding-highlight");
                // overlay takes care of the dark background except for highlighted
                overlay.style.display = 'none'; // Use the CSS box-shadow trick for highlighting instead
            }
        } else {
            targetElement = null;
            overlay.style.display = 'block'; // full dark bg for center modal
        }

        tooltip.innerHTML = `
            <h3>${step.title}</h3>
            <p>${step.text}</p>
            <button class="skip-btn" onclick="window.finishOnboarding()">Skip</button>
            <button class="nav-btn" onclick="window.nextOnboardingStep()">${step.action}</button>
            <div style="clear:both;"></div>
        `;

        updateTooltipPosition();

        if (step.onShow) step.onShow();
    }

    function updateTooltipPosition() {
        if (!targetElement) {
            // Center it
            tooltip.style.top = "50%";
            tooltip.style.left = "50%";
            tooltip.style.transform = "translate(-50%, -50%)";
            return;
        }

        tooltip.style.transform = "none";
        const rect = targetElement.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const step = steps[stepIndex];

        let top = rect.bottom + 15;
        let left = rect.left;

        if (stepIndex === 1 || stepIndex === 2) {
            top = rect.top;
            left = rect.right + 20;
        } else if (stepIndex === 3 || stepIndex === 4) {
            top = rect.top - tooltipRect.height - 15;
            left = rect.left;
        } else if (step.position === "above") {
            top = rect.top - tooltipRect.height - 15;
            left = rect.left;
        }

        // Prevent falling off screen
        if (top + tooltipRect.height > window.innerHeight) {
            top = Math.max(10, window.innerHeight - tooltipRect.height - 15);
        }
        if (top < 10) {
            top = 10;
        }
        if (left + tooltipRect.width > window.innerWidth) {
            left = Math.max(10, window.innerWidth - tooltipRect.width - 15);
            if ((stepIndex === 1 || stepIndex === 2) && left < rect.right) {
                 top = rect.bottom + 15;
                 left = rect.left;
            }
        }

        tooltip.style.top = top + "px";
        tooltip.style.left = Math.max(10, left) + "px";
    }

    window.nextOnboardingStep = () => {
        stepIndex++;
        if (stepIndex >= steps.length) {
            window.finishOnboarding();
        } else {
            renderStep();
        }
    };

    window.finishOnboarding = () => {
        document.querySelectorAll('.onboarding-highlight').forEach(el => el.classList.remove('onboarding-highlight'));
        const playBtn = document.getElementById("playBtn");
        if(playBtn) playBtn.classList.remove("pulse-highlight");
        
        if(overlay) overlay.remove();
        if(tooltip) tooltip.remove();
        
        localStorage.setItem(HAS_SEEN_TUTORIAL_KEY, "true");
    };

})();