/**
 * Windows 95 Solitaire (Klondike) Engine
 * Faithful reproduction of the classic Windows 95 Solitaire
 */

(function() {
    // Suits & Ranks definitions
    const SUITS = ['spades', 'hearts', 'clubs', 'diamonds'];
    const SUIT_SYMBOLS = { spades: '♠', hearts: '♥', clubs: '♣', diamonds: '♦' };
    const SUIT_COLORS = { spades: 'black', hearts: 'red', clubs: 'black', diamonds: 'red' };
    const RANK_NAMES = { 1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K' };

    // Game state
    let stock = [];
    let waste = [];
    let foundations = { spades: [], hearts: [], clubs: [], diamonds: [] };
    let tableau = [[], [], [], [], [], [], []];
    
    let drawCount = 1;
    let score = 0;
    let secondsElapsed = 0;
    let timerInterval = null;
    let gameStarted = false;
    let selectedCard = null; // { card, source: 'waste'|'foundation'|'tableau', colIndex, cardIndex }

    // Drag and drop state
    let isDragging = false;
    let dragData = null; // { cards: [], source: ..., startX, startY, offsetX, offsetY }
    let ghostElement = null;

    // Victory animation state
    let winAnimRunning = false;
    let winAnimFrame = null;
    let winCards = [];

    // DOM Elements
    let tableEl, stockSlotEl, wasteSlotEl;
    let foundationEls = {};
    let tableauColEls = [];
    let scoreEl, timeEl;
    let winCanvas, winCtx, winBanner;

    document.addEventListener('DOMContentLoaded', initSolitaire);

    function initSolitaire() {
        tableEl = document.getElementById('solitaireTable');
        if (!tableEl) return;

        stockSlotEl = document.getElementById('solitaireStock');
        wasteSlotEl = document.getElementById('solitaireWaste');
        
        SUITS.forEach(suit => {
            foundationEls[suit] = document.getElementById('solitaireFoundation-' + suit);
        });

        for (let i = 0; i < 7; i++) {
            tableauColEls.push(document.getElementById('solitaireCol-' + i));
        }

        scoreEl = document.getElementById('solitaireScore');
        timeEl = document.getElementById('solitaireTime');
        winCanvas = document.getElementById('solitaireWinCanvas');
        if (winCanvas) winCtx = winCanvas.getContext('2d');
        winBanner = document.getElementById('solitaireWinBanner');

        setupEvents();
        dealNewGame();
    }

    function setupEvents() {
        // Stock click
        stockSlotEl.addEventListener('click', handleStockClick);

        // Waste slot click
        wasteSlotEl.addEventListener('click', function(e) {
            if (waste.length > 0) {
                const topCard = waste[waste.length - 1];
                handleCardClick(topCard, { source: 'waste', cardIndex: waste.length - 1 });
            }
        });

        // Foundation slots click
        SUITS.forEach(suit => {
            const fEl = foundationEls[suit];
            if (fEl) {
                fEl.addEventListener('click', function(e) {
                    handleFoundationSlotClick(suit);
                });
            }
        });

        // Tableau columns click
        tableauColEls.forEach((colEl, colIndex) => {
            colEl.addEventListener('click', function(e) {
                // If user clicked the empty column base
                if (e.target === colEl || (tableau[colIndex].length === 0 && colEl.contains(e.target))) {
                    handleEmptyColumnClick(colIndex);
                }
            });
        });

        // Menu Dropdown toggle
        const menuBtns = document.querySelectorAll('.solitaire-menu-btn');
        menuBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const wasActive = this.classList.contains('active');
                closeAllMenus();
                if (!wasActive) {
                    this.classList.add('active');
                    const dropdown = this.querySelector('.solitaire-dropdown');
                    if (dropdown) dropdown.classList.add('active');
                }
            });
        });

        document.addEventListener('click', closeAllMenus);

        // Menu Actions
        const dealBtn = document.getElementById('menuSolitaireDeal');
        if (dealBtn) {
            dealBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                closeAllMenus();
                dealNewGame();
            });
        }

        const draw1Btn = document.getElementById('menuSolitaireDraw1');
        if (draw1Btn) {
            draw1Btn.addEventListener('click', function(e) {
                e.stopPropagation();
                closeAllMenus();
                drawCount = 1;
                draw1Btn.textContent = '✓ Draw 1';
                const draw3Btn = document.getElementById('menuSolitaireDraw3');
                if (draw3Btn) draw3Btn.textContent = '  Draw 3';
                dealNewGame();
            });
        }

        const draw3Btn = document.getElementById('menuSolitaireDraw3');
        if (draw3Btn) {
            draw3Btn.addEventListener('click', function(e) {
                e.stopPropagation();
                closeAllMenus();
                drawCount = 3;
                draw3Btn.textContent = '✓ Draw 3';
                const draw1Btn = document.getElementById('menuSolitaireDraw1');
                if (draw1Btn) draw1Btn.textContent = '  Draw 1';
                dealNewGame();
            });
        }

        const demoWinBtn = document.getElementById('menuSolitaireDemoWin');
        if (demoWinBtn) {
            demoWinBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                closeAllMenus();
                triggerVictory();
            });
        }

        const exitBtn = document.getElementById('menuSolitaireExit');
        if (exitBtn) {
            exitBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                closeAllMenus();
                stopTimer();
                stopVictoryAnimation();

                // Trigger window close button (identically to clicking 'X')
                const win = document.getElementById('solitaireWindow');
                if (win) {
                    const closeBtn = win.querySelector('.window-controls .window-btn:nth-child(3)');
                    if (closeBtn) {
                        closeBtn.click();
                        return;
                    }
                }

                if (typeof closeWindow === 'function') {
                    closeWindow('solitaireWindow');
                } else if (window.closeWindow) {
                    window.closeWindow('solitaireWindow');
                }
            });
        }

        const aboutBtn = document.getElementById('menuSolitaireAbout');
        if (aboutBtn) {
            aboutBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                closeAllMenus();
                alert('Windows 95 Solitaire\nPortfolio Edition for Sergio Andrés Aparicio Galvis\nImplemented in vanilla JavaScript & CSS.');
            });
        }

        // F2 Shortcut for Deal
        document.addEventListener('keydown', function(e) {
            if (e.key === 'F2') {
                const win = document.getElementById('solitaireWindow');
                if (win && win.classList.contains('active')) {
                    e.preventDefault();
                    dealNewGame();
                }
            }
        });

        // Win canvas click stops animation
        if (winCanvas) {
            winCanvas.addEventListener('click', () => {
                stopVictoryAnimation();
                dealNewGame();
            });
        }

        // Global mouse handlers for Drag & Drop
        document.addEventListener('mousemove', handleGlobalMouseMove);
        document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    function closeAllMenus() {
        document.querySelectorAll('.solitaire-menu-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.solitaire-dropdown').forEach(d => d.classList.remove('active'));
    }

    // Timer management
    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        gameStarted = true;
        timerInterval = setInterval(() => {
            secondsElapsed++;
            updateStats();
        }, 1000);
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function updateStats() {
        if (scoreEl) scoreEl.textContent = 'Score: ' + score;
        if (timeEl) timeEl.textContent = 'Time: ' + secondsElapsed + 's';
    }

    // Deck Generation & Shuffle
    function createDeck() {
        const deck = [];
        let id = 1;
        SUITS.forEach(suit => {
            for (let rank = 1; rank <= 13; rank++) {
                deck.push({
                    id: id++,
                    suit: suit,
                    rank: rank,
                    faceUp: false
                });
            }
        });
        return deck;
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Deal a new game
    function dealNewGame() {
        stopTimer();
        stopVictoryAnimation();

        score = 0;
        secondsElapsed = 0;
        gameStarted = false;
        selectedCard = null;
        updateStats();

        const deck = shuffle(createDeck());

        // Reset piles
        stock = [];
        waste = [];
        foundations = { spades: [], hearts: [], clubs: [], diamonds: [] };
        tableau = [[], [], [], [], [], [], []];

        // Populate tableau (standard Klondike)
        for (let col = 0; col < 7; col++) {
            for (let row = 0; row <= col; row++) {
                const card = deck.pop();
                card.faceUp = (row === col); // Top card face-up
                tableau[col].push(card);
            }
        }

        // Remaining 24 cards to stock
        while (deck.length > 0) {
            const card = deck.pop();
            card.faceUp = false;
            stock.push(card);
        }

        renderBoard();
    }

    // Render entire board
    function renderBoard() {
        renderStock();
        renderWaste();
        renderFoundations();
        renderTableau();
        updateStats();
    }

    // Render Stock
    function renderStock() {
        stockSlotEl.innerHTML = '';
        if (stock.length > 0) {
            const cardEl = createCardElement(stock[stock.length - 1]);
            cardEl.style.position = 'relative';
            stockSlotEl.appendChild(cardEl);
        }
    }

    // Render Waste
    function renderWaste() {
        wasteSlotEl.innerHTML = '';
        if (waste.length > 0) {
            // Show up to the last 3 cards if drawCount is 3, else 1
            const countToShow = Math.min(waste.length, drawCount === 3 ? 3 : 1);
            const startIndex = waste.length - countToShow;

            for (let i = startIndex; i < waste.length; i++) {
                const card = waste[i];
                const cardEl = createCardElement(card);
                const offset = (i - startIndex) * 14;
                cardEl.style.left = offset + 'px';
                
                // Only top card is interactive
                if (i === waste.length - 1) {
                    attachCardInteraction(cardEl, card, { source: 'waste', cardIndex: i });
                }
                wasteSlotEl.appendChild(cardEl);
            }
        }
    }

    // Render Foundations
    function renderFoundations() {
        SUITS.forEach(suit => {
            const fEl = foundationEls[suit];
            fEl.innerHTML = '';
            const pile = foundations[suit];
            if (pile.length > 0) {
                const topCard = pile[pile.length - 1];
                const cardEl = createCardElement(topCard);
                cardEl.style.position = 'relative';
                attachCardInteraction(cardEl, topCard, { source: 'foundation', suit: suit, cardIndex: pile.length - 1 });
                fEl.appendChild(cardEl);
            }
        });
    }

    // Render Tableau
    function renderTableau() {
        tableauColEls.forEach((colEl, colIndex) => {
            colEl.innerHTML = '';
            const pile = tableau[colIndex];
            let topOffset = 0;

            pile.forEach((card, cardIndex) => {
                const cardEl = createCardElement(card);
                cardEl.style.top = topOffset + 'px';
                cardEl.style.zIndex = cardIndex + 1;

                if (card.faceUp) {
                    attachCardInteraction(cardEl, card, { source: 'tableau', colIndex: colIndex, cardIndex: cardIndex });
                    topOffset += 22; // Face-up cards spacing
                } else {
                    // Face-down card
                    cardEl.addEventListener('click', function(e) {
                        e.stopPropagation();
                        // If it's the top-most card of the column, flip it up!
                        if (cardIndex === pile.length - 1) {
                            card.faceUp = true;
                            score += 5;
                            renderBoard();
                        }
                    });
                    topOffset += 12; // Face-down cards spacing
                }

                colEl.appendChild(cardEl);
            });
        });
    }

    // Create Card DOM element
    function createCardElement(card) {
        const el = document.createElement('div');
        el.className = 'solitaire-card';
        el.dataset.cardId = card.id;

        if (!card.faceUp) {
            el.classList.add('card-back');
            return el;
        }

        el.classList.add('card-face');
        const isRed = SUIT_COLORS[card.suit] === 'red';
        el.classList.add(isRed ? 'red' : 'black');

        if (selectedCard && selectedCard.card.id === card.id) {
            el.classList.add('selected');
        }

        const rankName = RANK_NAMES[card.rank];
        const suitSymbol = SUIT_SYMBOLS[card.suit];

        // Top-left corner
        const cornerTop = document.createElement('div');
        cornerTop.className = 'card-corner top-left';
        cornerTop.innerHTML = `<span class="card-rank">${rankName}</span><span class="card-suit">${suitSymbol}</span>`;
        el.appendChild(cornerTop);

        // Center Pip / Figure
        const center = document.createElement('div');
        center.className = 'card-center';
        if (card.rank >= 11) {
            center.classList.add('is-face');
            center.textContent = rankName;
        } else if (card.rank === 1) {
            center.textContent = suitSymbol;
        } else {
            center.textContent = suitSymbol;
        }
        el.appendChild(center);

        // Bottom-right corner
        const cornerBottom = document.createElement('div');
        cornerBottom.className = 'card-corner bottom-right';
        cornerBottom.innerHTML = `<span class="card-rank">${rankName}</span><span class="card-suit">${suitSymbol}</span>`;
        el.appendChild(cornerBottom);

        return el;
    }

    // Attach card event handlers (Click, Double-click, Drag)
    function attachCardInteraction(cardEl, card, sourceInfo) {
        // Double click -> Auto send to foundation
        cardEl.addEventListener('dblclick', function(e) {
            e.stopPropagation();
            if (!gameStarted) startTimer();
            autoSendToFoundation(card, sourceInfo);
        });

        // Single click -> Select or move
        cardEl.addEventListener('click', function(e) {
            e.stopPropagation();
            if (isDragging) return;
            handleCardClick(card, sourceInfo);
        });

        // Mousedown -> Start Drag
        cardEl.addEventListener('mousedown', function(e) {
            if (e.button !== 0) return; // Only left click
            startDragging(e, card, sourceInfo, cardEl);
        });
    }

    // Handle stock click (draw or recycle)
    function handleStockClick() {
        if (!gameStarted) startTimer();
        clearSelection();

        if (stock.length > 0) {
            const countToDraw = Math.min(drawCount, stock.length);
            for (let i = 0; i < countToDraw; i++) {
                const card = stock.pop();
                card.faceUp = true;
                waste.push(card);
            }
        } else {
            // Recycle waste back to stock
            if (waste.length === 0) return;
            while (waste.length > 0) {
                const card = waste.pop();
                card.faceUp = false;
                stock.push(card);
            }
            score = Math.max(0, score - 20); // standard penalty
        }
        renderBoard();
    }

    // Handle card click (Click-to-Move mechanics)
    function handleCardClick(card, sourceInfo) {
        if (!gameStarted) startTimer();

        // If no card is selected, select this one
        if (!selectedCard) {
            selectedCard = { card: card, ...sourceInfo };
            renderBoard();
            return;
        }

        // If clicking the currently selected card, deselect
        if (selectedCard.card.id === card.id) {
            clearSelection();
            renderBoard();
            return;
        }

        // Try to move the selected card/stack onto this card
        if (sourceInfo.source === 'tableau') {
            const targetColIndex = sourceInfo.colIndex;
            const targetPile = tableau[targetColIndex];
            const targetTopCard = targetPile[targetPile.length - 1];

            // Can only place on top card of tableau column
            if (targetTopCard && targetTopCard.id === card.id) {
                if (canStackOnTableau(selectedCard.card, targetTopCard)) {
                    executeMove(selectedCard, { target: 'tableau', colIndex: targetColIndex });
                    clearSelection();
                    return;
                }
            }
        }

        // If move was invalid, change selection to clicked card
        selectedCard = { card: card, ...sourceInfo };
        renderBoard();
    }

    // Handle empty column click
    function handleEmptyColumnClick(colIndex) {
        if (!selectedCard) return;
        if (tableau[colIndex].length === 0) {
            // Only King can be placed on empty column
            if (selectedCard.card.rank === 13) {
                executeMove(selectedCard, { target: 'tableau', colIndex: colIndex });
                clearSelection();
            }
        }
    }

    // Handle foundation slot click
    function handleFoundationSlotClick(suit) {
        if (!selectedCard) return;

        // Can only move single card to foundation
        if (selectedCard.source === 'tableau') {
            const pile = tableau[selectedCard.colIndex];
            if (selectedCard.cardIndex !== pile.length - 1) {
                return; // Stack of cards cannot go to foundation
            }
        }

        if (canPlaceOnFoundation(selectedCard.card, suit)) {
            executeMove(selectedCard, { target: 'foundation', suit: suit });
            clearSelection();
        }
    }

    // Move legality validation
    function canStackOnTableau(card, targetCard) {
        if (!targetCard.faceUp) return false;
        const diffRank = targetCard.rank - card.rank === 1;
        const diffColor = SUIT_COLORS[targetCard.suit] !== SUIT_COLORS[card.suit];
        return diffRank && diffColor;
    }

    function canPlaceOnFoundation(card, suit) {
        if (card.suit !== suit) return false;
        const pile = foundations[suit];
        if (pile.length === 0) {
            return card.rank === 1; // Ace
        } else {
            const top = pile[pile.length - 1];
            return card.rank - top.rank === 1;
        }
    }

    // Auto-send card to foundation (Double Click)
    function autoSendToFoundation(card, sourceInfo) {
        // Can only move single card (must be top of its pile)
        if (sourceInfo.source === 'tableau') {
            const pile = tableau[sourceInfo.colIndex];
            if (sourceInfo.cardIndex !== pile.length - 1) return;
        }

        // Check if fits in its own suit foundation
        if (canPlaceOnFoundation(card, card.suit)) {
            executeMove(sourceInfo, { target: 'foundation', suit: card.suit });
            clearSelection();
            return;
        }

        // If not, see if it can stack onto a tableau column
        for (let col = 0; col < 7; col++) {
            if (sourceInfo.source === 'tableau' && sourceInfo.colIndex === col) continue;
            const pile = tableau[col];
            if (pile.length === 0) {
                if (card.rank === 13) {
                    executeMove(sourceInfo, { target: 'tableau', colIndex: col });
                    clearSelection();
                    return;
                }
            } else {
                const top = pile[pile.length - 1];
                if (canStackOnTableau(card, top)) {
                    executeMove(sourceInfo, { target: 'tableau', colIndex: col });
                    clearSelection();
                    return;
                }
            }
        }
    }

    // Execute Move
    function executeMove(source, dest) {
        let movingCards = [];

        // Extract cards from source
        if (source.source === 'waste') {
            movingCards = [waste.pop()];
        } else if (source.source === 'foundation') {
            movingCards = [foundations[source.suit].pop()];
            score = Math.max(0, score - 15);
        } else if (source.source === 'tableau') {
            const pile = tableau[source.colIndex];
            movingCards = pile.splice(source.cardIndex);
            
            // Flip previous card in tableau if face-down
            if (pile.length > 0 && !pile[pile.length - 1].faceUp) {
                pile[pile.length - 1].faceUp = true;
                score += 5;
            }
        }

        // Place cards into destination
        if (dest.target === 'tableau') {
            tableau[dest.colIndex].push(...movingCards);
            if (source.source === 'waste') score += 5;
        } else if (dest.target === 'foundation') {
            foundations[dest.suit].push(...movingCards);
            score += 10;
        }

        renderBoard();
        checkVictory();
    }

    function clearSelection() {
        selectedCard = null;
    }

    // Drag and Drop implementation
    function startDragging(e, card, sourceInfo, cardEl) {
        if (!card.faceUp) return;

        let cardsToDrag = [];
        if (sourceInfo.source === 'tableau') {
            const pile = tableau[sourceInfo.colIndex];
            cardsToDrag = pile.slice(sourceInfo.cardIndex);
        } else if (sourceInfo.source === 'waste') {
            if (sourceInfo.cardIndex !== waste.length - 1) return;
            cardsToDrag = [waste[waste.length - 1]];
        } else if (sourceInfo.source === 'foundation') {
            cardsToDrag = [foundations[sourceInfo.suit][foundations[sourceInfo.suit].length - 1]];
        }

        if (cardsToDrag.length === 0) return;

        isDragging = true;
        const rect = cardEl.getBoundingClientRect();

        dragData = {
            card: card,
            sourceInfo: sourceInfo,
            cards: cardsToDrag,
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top,
            originEl: cardEl
        };

        // Create ghost container
        ghostElement = document.createElement('div');
        ghostElement.className = 'solitaire-drag-ghost';
        ghostElement.style.left = (e.clientX - dragData.offsetX) + 'px';
        ghostElement.style.top = (e.clientY - dragData.offsetY) + 'px';

        let offsetTop = 0;
        cardsToDrag.forEach(c => {
            const cEl = createCardElement(c);
            cEl.style.position = 'absolute';
            cEl.style.top = offsetTop + 'px';
            cEl.style.left = '0px';
            cEl.style.boxShadow = '3px 3px 8px rgba(0,0,0,0.5)';
            ghostElement.appendChild(cEl);
            offsetTop += 22;
        });

        document.body.appendChild(ghostElement);
    }

    function handleGlobalMouseMove(e) {
        if (!isDragging || !ghostElement) return;
        ghostElement.style.left = (e.clientX - dragData.offsetX) + 'px';
        ghostElement.style.top = (e.clientY - dragData.offsetY) + 'px';
    }

    function handleGlobalMouseUp(e) {
        if (!isDragging) return;
        isDragging = false;

        if (ghostElement) {
            ghostElement.remove();
            ghostElement = null;
        }

        // Detect element under drop point (hide ghost first)
        const targetElement = document.elementFromPoint(e.clientX, e.clientY);
        if (targetElement && dragData) {
            handleDrop(targetElement, dragData);
        }

        dragData = null;
    }

    function handleDrop(targetEl, data) {
        const card = data.card;
        const sourceInfo = data.sourceInfo;

        // Check if dropped over a Foundation
        const foundationSlot = targetEl.closest('.card-slot.foundation-slot');
        if (foundationSlot) {
            const suit = foundationSlot.dataset.suit;
            if (data.cards.length === 1 && canPlaceOnFoundation(card, suit)) {
                executeMove(sourceInfo, { target: 'foundation', suit: suit });
                clearSelection();
                return;
            }
        }

        // Check if dropped over a Tableau column or card
        const tableauCol = targetEl.closest('.tableau-column');
        if (tableauCol) {
            const colIndex = parseInt(tableauCol.id.replace('solitaireCol-', ''), 10);
            const pile = tableau[colIndex];

            if (pile.length === 0) {
                if (card.rank === 13) { // King
                    executeMove(sourceInfo, { target: 'tableau', colIndex: colIndex });
                    clearSelection();
                    return;
                }
            } else {
                const topCard = pile[pile.length - 1];
                if (canStackOnTableau(card, topCard)) {
                    executeMove(sourceInfo, { target: 'tableau', colIndex: colIndex });
                    clearSelection();
                    return;
                }
            }
        }
    }

    // Check Victory
    function checkVictory() {
        const totalFoundationCards = SUITS.reduce((sum, suit) => sum + foundations[suit].length, 0);
        if (totalFoundationCards === 52) {
            triggerVictory();
        }
    }

    // Legendary Windows 95 Bouncing Card Cascade Animation
    function triggerVictory() {
        stopTimer();
        winAnimRunning = true;

        if (winBanner) winBanner.style.display = 'block';

        if (!winCanvas) return;
        winCanvas.classList.add('active');

        // Set canvas resolution to container size
        const rect = tableEl.getBoundingClientRect();
        winCanvas.width = rect.width;
        winCanvas.height = rect.height;

        // Collect all cards for the cascade (Kings first down to Aces)
        winCards = [];
        const cardWidth = 72;
        const cardHeight = 98;

        for (let rank = 13; rank >= 1; rank--) {
            SUITS.forEach(suit => {
                const fEl = foundationEls[suit];
                let startX = 400;
                let startY = 14;
                if (fEl) {
                    const fRect = fEl.getBoundingClientRect();
                    startX = fRect.left - rect.left;
                    startY = fRect.top - rect.top;
                }

                // Initial velocities
                const vx = (Math.random() > 0.5 ? 1 : -1) * (3.5 + Math.random() * 4);
                const vy = -(2 + Math.random() * 4);

                winCards.push({
                    rank: rank,
                    suit: suit,
                    x: startX,
                    y: startY,
                    vx: vx,
                    vy: vy,
                    active: false,
                    finished: false
                });
            });
        }

        let currentCardIndex = 0;
        if (winCards.length > 0) {
            winCards[0].active = true;
        }

        const gravity = 0.55;
        const bounceDamping = 0.85;

        function animateCascade() {
            if (!winAnimRunning) return;

            let anyActive = false;

            winCards.forEach((c, idx) => {
                if (!c.active || c.finished) return;
                anyActive = true;

                // Physics step
                c.vy += gravity;
                c.x += c.vx;
                c.y += c.vy;

                // Bounce on bottom
                if (c.y + cardHeight >= winCanvas.height) {
                    c.y = winCanvas.height - cardHeight;
                    c.vy = -Math.abs(c.vy) * bounceDamping;

                    // If bouncing very low, keep moving sideways
                    if (Math.abs(c.vy) < 1.5) {
                        c.vy = 0;
                    }
                }

                // Render card at this frame (NO clearRect -> leaving the iconic trail!)
                drawCardOnCanvas(winCtx, c, cardWidth, cardHeight);

                // If card falls off left or right screen
                if (c.x < -cardWidth || c.x > winCanvas.width + cardWidth) {
                    c.finished = true;
                }
            });

            // Activate next card periodically
            if (currentCardIndex < winCards.length - 1) {
                const curr = winCards[currentCardIndex];
                if (curr.y > 60 || curr.finished) {
                    currentCardIndex++;
                    winCards[currentCardIndex].active = true;
                }
            }

            winAnimFrame = requestAnimationFrame(animateCascade);
        }

        winAnimFrame = requestAnimationFrame(animateCascade);
    }

    function drawCardOnCanvas(ctx, card, width, height) {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;

        // Card body
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(card.x, card.y, width, height, 3) : ctx.rect(card.x, card.y, width, height);
        ctx.fill();
        ctx.stroke();

        // Card Text & Suit
        const isRed = SUIT_COLORS[card.suit] === 'red';
        ctx.fillStyle = isRed ? '#cc0000' : '#000000';
        ctx.font = 'bold 12px Arial, sans-serif';

        const rankStr = RANK_NAMES[card.rank];
        const suitStr = SUIT_SYMBOLS[card.suit];

        // Top-left corner
        ctx.fillText(rankStr, card.x + 4, card.y + 14);
        ctx.fillText(suitStr, card.x + 4, card.y + 26);

        // Center pip/symbol
        ctx.font = '24px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(suitStr, card.x + width / 2, card.y + height / 2 + 8);

        ctx.restore();
    }

    function stopVictoryAnimation() {
        winAnimRunning = false;
        if (winAnimFrame) cancelAnimationFrame(winAnimFrame);
        if (winCanvas) {
            winCanvas.classList.remove('active');
            if (winCtx) winCtx.clearRect(0, 0, winCanvas.width, winCanvas.height);
        }
        if (winBanner) winBanner.style.display = 'none';
    }

    // Expose for external controls if needed
    window.Solitaire = {
        deal: dealNewGame,
        demoWin: triggerVictory
    };

})();
