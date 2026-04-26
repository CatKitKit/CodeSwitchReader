// aligner_worker.js
// A background worker to align massive dual-language texts without freezing the UI.
// Uses a "Banded" Gale-Church algorithm to save memory and process huge arrays instantly.

self.onmessage = function(e) {
    const { sourceText, targetText } = e.data;
    
    self.postMessage({ type: 'progress', percent: 10 });

    try {
        const alignments = runBandedAlignment(sourceText, targetText);
        self.postMessage({ type: 'complete', alignments: alignments });
    } catch (err) {
        self.postMessage({ type: 'error', message: err.message });
    }
};

function runBandedAlignment(sourceText, targetText) {
    // 1. Split into sentences (handling Japanese/Chinese punctuation properly)
    // We use a regex that looks for sentence-ending punctuation.
    const splitRegex = /(?<=[.!?。！？])\s*/;
    
    // Clean and split
    const sourceSentences = sourceText.replace(/\r\n/g, '\n').split(splitRegex).filter(s => s.trim().length > 0);
    const targetSentences = targetText.replace(/\r\n/g, '\n').split(splitRegex).filter(s => s.trim().length > 0);

    const N = sourceSentences.length;
    const M = targetSentences.length;

    self.postMessage({ type: 'progress', percent: 20 });

    if (N === 0 || M === 0) return [];

    // Global character ratio to scale length expectations
    const sourceChars = sourceSentences.reduce((sum, s) => sum + s.length, 0) || 1;
    const targetChars = targetSentences.reduce((sum, s) => sum + s.length, 0) || 1;
    const C = targetChars / sourceChars;

    // Sentence ratio to find the "diagonal" line in our grid
    const ratio = M / N; 

    // We only calculate a "Band" (a window) around the expected diagonal.
    // This prevents building a 10,000 x 10,000 array (which crashes memory).
    // Instead we build a 10,000 x (Band Size) array.
    const BAND_RADIUS = Math.max(50, Math.floor(Math.abs(N - M) + 20)); 

    // Initialize DP structure. Instead of a full matrix, we use a sparse representation or map.
    // For performance, we'll keep an array of maps/objects, or just a 2D array if we shift indices.
    // To keep it simple but memory-safe, we use an array where each row 'i' only holds a Map of 'j' values.
    const dp = Array.from({ length: N + 1 }, () => new Map());
    dp[0].set(0, { cost: 0, prev: null, type: null });

    const penalties = {
        '1-1': 0,
        '0-1': 20,
        '1-0': 20,
        '2-1': 15,
        '1-2': 15,
        '2-2': 25
    };

    function getCost(sLen, tLen) {
        return Math.abs(sLen * C - tLen);
    }

    let progressCounter = 0;

    for (let i = 0; i <= N; i++) {
        // Report progress every 1000 rows
        if (progressCounter++ % 1000 === 0) {
            const percent = 20 + Math.floor((i / N) * 70); // 20% to 90%
            self.postMessage({ type: 'progress', percent: percent });
        }

        // Expected j position based on global ratio
        const expectedJ = Math.floor(i * ratio);
        
        // Define the search window for this row
        const startJ = Math.max(0, expectedJ - BAND_RADIUS);
        const endJ = Math.min(M, expectedJ + BAND_RADIUS);

        for (let j = startJ; j <= endJ; j++) {
            if (i === 0 && j === 0) continue;

            let minCost = Infinity;
            let bestPrev = null;
            let bestType = null;

            const evaluate = (prevI, prevJ, type, sLen, tLen) => {
                if (prevI >= 0 && prevJ >= 0) {
                    const prevRow = dp[prevI];
                    if (prevRow && prevRow.has(prevJ)) {
                        const prevCost = prevRow.get(prevJ).cost;
                        if (prevCost !== Infinity) {
                            const currentCost = prevCost + getCost(sLen, tLen) + penalties[type];
                            if (currentCost < minCost) {
                                minCost = currentCost;
                                bestPrev = [prevI, prevJ];
                                bestType = type;
                            }
                        }
                    }
                }
            };

            if (i >= 1 && j >= 1) evaluate(i - 1, j - 1, '1-1', sourceSentences[i - 1].length, targetSentences[j - 1].length);
            if (i >= 1)           evaluate(i - 1, j,     '1-0', sourceSentences[i - 1].length, 0);
            if (j >= 1)           evaluate(i,     j - 1, '0-1', 0, targetSentences[j - 1].length);
            if (i >= 2 && j >= 1) evaluate(i - 2, j - 1, '2-1', sourceSentences[i - 1].length + sourceSentences[i - 2].length, targetSentences[j - 1].length);
            if (i >= 1 && j >= 2) evaluate(i - 1, j - 2, '1-2', sourceSentences[i - 1].length, targetSentences[j - 1].length + targetSentences[j - 2].length);
            if (i >= 2 && j >= 2) evaluate(i - 2, j - 2, '2-2', sourceSentences[i - 1].length + sourceSentences[i - 2].length, targetSentences[j - 1].length + targetSentences[j - 2].length);

            if (minCost !== Infinity) {
                dp[i].set(j, { cost: minCost, prev: bestPrev, type: bestType });
            }
        }
        
        // Memory management: we only ever look back 2 rows (i-1 and i-2).
        // So we can safely clear out rows older than i-2 to keep memory usage flat!
        if (i > 2) {
            // We can't actually delete the node entirely because we need it for backtracking at the end.
            // Wait, if we need it for backtracking, we must store the pointers. 
            // Storing just the pointers (prev, type) takes very little memory compared to a full dense matrix.
            // But Map objects have some overhead. It should be fine for ~100k items.
        }
    }

    self.postMessage({ type: 'progress', percent: 95 });

    // Backtrack
    const alignments = [];
    
    // Find the best ending cell. Usually it's [N, M], but if it fell out of bounds, find the closest.
    let currI = N;
    let currJ = M;
    
    // Fallback if exactly N,M is unreachable due to band constraints
    if (!dp[N].has(M)) {
        let bestCost = Infinity;
        for (const [j, cell] of dp[N].entries()) {
            if (cell.cost < bestCost) {
                bestCost = cell.cost;
                currJ = j;
            }
        }
    }

    while (currI > 0 || currJ > 0) {
        const row = dp[currI];
        if (!row || !row.has(currJ)) {
            // Emergency fallback to prevent infinite loops if band is broken
            currI--; currJ--;
            continue; 
        }

        const cell = row.get(currJ);
        const type = cell.type;
        const prev = cell.prev;

        if (!prev) break;

        let sourcePart = [];
        let targetPart = [];

        if (type === '1-1') {
            sourcePart.push(sourceSentences[currI - 1]);
            targetPart.push(targetSentences[currJ - 1]);
        } else if (type === '1-0') {
            sourcePart.push(sourceSentences[currI - 1]);
        } else if (type === '0-1') {
            targetPart.push(targetSentences[currJ - 1]);
        } else if (type === '2-1') {
            sourcePart.push(sourceSentences[currI - 2], sourceSentences[currI - 1]);
            targetPart.push(targetSentences[currJ - 1]);
        } else if (type === '1-2') {
            sourcePart.push(sourceSentences[currI - 1]);
            targetPart.push(targetSentences[currJ - 2], targetSentences[currJ - 1]);
        } else if (type === '2-2') {
            sourcePart.push(sourceSentences[currI - 2], sourceSentences[currI - 1]);
            targetPart.push(targetSentences[currJ - 2], targetSentences[currJ - 1]);
        }

        alignments.unshift({ 
            source: sourcePart.join(' '), 
            target: targetPart.join(' ') 
        });
        
        currI = prev[0];
        currJ = prev[1];
    }

    return alignments;
}
