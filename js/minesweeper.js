/**
 * Windows 95 Minesweeper Game Engine
 * Portfolio Edition for Sergio Andrés Aparicio Galvis
 */

(function() {
    // Game Difficulties
    const DIFFICULTIES = {
        beginner: { rows: 9, cols: 9, mines: 10, name: 'Principiante', width: '250px' },
        intermediate: { rows: 16, cols: 16, mines: 40, name: 'Intermedio', width: '420px' },
        expert: { rows: 16, cols: 30, mines: 99, name: 'Experto', width: '740px' }
    };

    let currentDifficulty = 'beginner';
    let rows = 9;
    let cols = 9;
    let totalMines = 10;

    let board = [];
    let gameStarted = false;
    let gameOver = false;
    let gameWon = false;
    let flagsPlaced = 0;
    let revealedCount = 0;
    let timerSeconds = 0;
    let timerInterval = null;
    let mobileMode = 'dig'; // 'dig' or 'flag'

    // DOM Elements
    let boardEl, mineCounterEl, timerEl, smileyIconEl, smileyBtnEl;
    let modeDigBtn, modeFlagBtn;

    // SVG graphics for cells
    const MINE_SVG = `<svg viewBox="0 0 16 16" width="16" height="16">
        <line x1="8" y1="1" x2="8" y2="15" stroke="#000" stroke-width="1.6"/>
        <line x1="1" y1="8" x2="15" y2="8" stroke="#000" stroke-width="1.6"/>
        <line x1="3" y1="3" x2="13" y2="13" stroke="#000" stroke-width="1.6"/>
        <line x1="3" y1="13" x2="13" y2="3" stroke="#000" stroke-width="1.6"/>
        <circle cx="8" cy="8" r="4.8" fill="#000"/>
        <circle cx="6.5" cy="6.5" r="1.3" fill="#fff"/>
    </svg>`;

    const FLAG_SVG = `<svg viewBox="0 0 16 16" width="16" height="16">
        <!-- Flag pole and base -->
        <rect x="7.5" y="3" width="1.5" height="10" fill="#000"/>
        <rect x="4" y="12" width="8" height="2" fill="#000"/>
        <rect x="5.5" y="10.5" width="5" height="1.5" fill="#000"/>
        <!-- Red pennant flag -->
        <polygon points="7.5,3 1,5.5 7.5,8" fill="#ff0000"/>
    </svg>`;

    // Init when DOM is loaded
    document.addEventListener('DOMContentLoaded', initMinesweeper);

    function initMinesweeper() {
        boardEl = document.getElementById('minesweeperBoard');
        mineCounterEl = document.getElementById('minesweeperMineCounter');
        timerEl = document.getElementById('minesweeperTimer');
        smileyBtnEl = document.getElementById('minesweeperSmileyBtn');
        smileyIconEl = document.getElementById('minesweeperSmileyIcon');

        modeDigBtn = document.getElementById('minesweeperModeDig');
        modeFlagBtn = document.getElementById('minesweeperModeFlag');

        if (!boardEl) return;

        // Smiley restart button
        if (smileyBtnEl) {
            smileyBtnEl.addEventListener('click', restartGame);
        }

        // Mobile Dig/Flag mode buttons
        if (modeDigBtn) {
            modeDigBtn.addEventListener('click', () => setMobileMode('dig'));
        }
        if (modeFlagBtn) {
            modeFlagBtn.addEventListener('click', () => setMobileMode('flag'));
        }

        // Top menu actions
        initMenuActions();

        // Keyboard F2 restart
        document.addEventListener('keydown', function(e) {
            if (e.key === 'F2') {
                const win = document.getElementById('minesweeperWindow');
                if (win && win.classList.contains('active')) {
                    e.preventDefault();
                    restartGame();
                }
            }
        });

        // Initialize game board
        setDifficulty('beginner');
    }

    function initMenuActions() {
        // Toggle Menus
        const menuBtns = document.querySelectorAll('.minesweeper-menu-btn');
        menuBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const wasActive = this.classList.contains('active');
                closeAllMinesweeperMenus();
                if (!wasActive) {
                    this.classList.add('active');
                    const dropdown = this.querySelector('.minesweeper-dropdown');
                    if (dropdown) dropdown.classList.add('active');
                }
            });
        });

        document.addEventListener('click', closeAllMinesweeperMenus);

        // Menu items
        const newGameBtn = document.getElementById('menuMineNew');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeAllMinesweeperMenus();
                restartGame();
            });
        }

        const diffBeginnerBtn = document.getElementById('menuMineBeginner');
        if (diffBeginnerBtn) {
            diffBeginnerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeAllMinesweeperMenus();
                setDifficulty('beginner');
            });
        }

        const diffIntermediateBtn = document.getElementById('menuMineIntermediate');
        if (diffIntermediateBtn) {
            diffIntermediateBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeAllMinesweeperMenus();
                setDifficulty('intermediate');
            });
        }

        const diffExpertBtn = document.getElementById('menuMineExpert');
        if (diffExpertBtn) {
            diffExpertBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeAllMinesweeperMenus();
                setDifficulty('expert');
            });
        }

        const exitBtn = document.getElementById('menuMineExit');
        if (exitBtn) {
            exitBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeAllMinesweeperMenus();
                if (window.closeWindow) window.closeWindow('minesweeperWindow');
            });
        }

        const aboutBtn = document.getElementById('menuMineAbout');
        if (aboutBtn) {
            aboutBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeAllMinesweeperMenus();
                alert('Buscaminas (Minesweeper) - Windows 95 Edition\nDesarrollado para el portafolio de Sergio Andrés Aparicio Galvis.\n¡Encuentra todas las minas sin hacerlas detonar!');
            });
        }
    }

    function closeAllMinesweeperMenus() {
        document.querySelectorAll('.minesweeper-menu-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.minesweeper-dropdown').forEach(d => d.classList.remove('active'));
    }

    function setMobileMode(mode) {
        mobileMode = mode;
        if (modeDigBtn) modeDigBtn.classList.toggle('active', mode === 'dig');
        if (modeFlagBtn) modeFlagBtn.classList.toggle('active', mode === 'flag');
    }

    function setDifficulty(diff) {
        if (!DIFFICULTIES[diff]) return;
        currentDifficulty = diff;
        const config = DIFFICULTIES[diff];
        rows = config.rows;
        cols = config.cols;
        totalMines = config.mines;

        // Update menu checked state
        ['beginner', 'intermediate', 'expert'].forEach(d => {
            const btn = document.getElementById('menuMine' + d.charAt(0).toUpperCase() + d.slice(1));
            if (btn) btn.classList.toggle('checked', d === diff);
        });

        // Resize window on desktop
        const win = document.getElementById('minesweeperWindow');
        if (win && window.innerWidth > 768) {
            win.style.width = config.width;
        }

        restartGame();
    }

    function restartGame() {
        stopTimer();
        gameStarted = false;
        gameOver = false;
        gameWon = false;
        flagsPlaced = 0;
        revealedCount = 0;
        timerSeconds = 0;

        setSmiley('normal');
        updateCounters();

        // Create empty board data
        board = [];
        for (let r = 0; r < rows; r++) {
            const rowArr = [];
            for (let c = 0; c < cols; c++) {
                rowArr.push({
                    row: r,
                    col: c,
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    isQuestion: false,
                    neighborMines: 0,
                    isExploded: false,
                    isWrongFlag: false
                });
            }
            board.push(rowArr);
        }

        renderBoardGrid();
    }

    function renderBoardGrid() {
        if (!boardEl) return;
        boardEl.innerHTML = '';
        boardEl.style.gridTemplateColumns = `repeat(${cols}, 22px)`;
        boardEl.style.gridTemplateRows = `repeat(${rows}, 22px)`;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cellEl = document.createElement('div');
                cellEl.className = 'minesweeper-cell';
                cellEl.dataset.row = r;
                cellEl.dataset.col = c;
                cellEl.id = `mineCell-${r}-${c}`;

                attachCellEvents(cellEl, r, c);
                boardEl.appendChild(cellEl);
            }
        }
    }

    function attachCellEvents(cellEl, r, c) {
        let touchTimer = null;
        let isLongTouch = false;

        // Right-Click (Desktop)
        cellEl.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            if (gameOver || gameWon) return;
            handleRightClick(r, c);
        });

        // Mouse Down (Scared Smiley)
        cellEl.addEventListener('mousedown', function(e) {
            if (gameOver || gameWon) return;
            if (e.button === 0 && !board[r][c].isRevealed && !board[r][c].isFlagged) {
                setSmiley('scared');
            }
        });

        // Mouse Up
        cellEl.addEventListener('mouseup', function(e) {
            if (gameOver || gameWon) return;
            setSmiley('normal');
        });

        // Left-Click (Desktop / Mobile)
        cellEl.addEventListener('click', function(e) {
            if (gameOver || gameWon) return;
            if (isLongTouch) {
                isLongTouch = false;
                return;
            }

            if (mobileMode === 'flag') {
                handleRightClick(r, c);
            } else {
                handleLeftClick(r, c);
            }
        });

        // Touch long-press support for flagging on mobile
        cellEl.addEventListener('touchstart', function(e) {
            if (gameOver || gameWon) return;
            isLongTouch = false;
            setSmiley('scared');

            touchTimer = setTimeout(() => {
                isLongTouch = true;
                handleRightClick(r, c);
                setSmiley('normal');
            }, 450);
        }, { passive: true });

        cellEl.addEventListener('touchend', function(e) {
            if (touchTimer) clearTimeout(touchTimer);
            if (!gameOver && !gameWon) setSmiley('normal');
        });

        cellEl.addEventListener('touchcancel', function(e) {
            if (touchTimer) clearTimeout(touchTimer);
            if (!gameOver && !gameWon) setSmiley('normal');
        });

        // Chording on double-click of revealed number
        cellEl.addEventListener('dblclick', function(e) {
            if (gameOver || gameWon) return;
            handleChording(r, c);
        });
    }

    // First Click: Safely place mines avoiding (startR, startC) and surrounding
    function generateMines(startR, startC) {
        let placed = 0;
        const protectedCoords = new Set();

        // Protect start cell and all 8 neighbors on first click
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = startR + dr;
                const nc = startC + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    protectedCoords.add(`${nr},${nc}`);
                }
            }
        }

        while (placed < totalMines) {
            const randR = Math.floor(Math.random() * rows);
            const randC = Math.floor(Math.random() * cols);
            const key = `${randR},${randC}`;

            if (!protectedCoords.has(key) && !board[randR][randC].isMine) {
                board[randR][randC].isMine = true;
                placed++;
            }
        }

        // Calculate neighbor numbers
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c].isMine) continue;
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
                            count++;
                        }
                    }
                }
                board[r][c].neighborMines = count;
            }
        }
    }

    function handleLeftClick(r, c) {
        const cell = board[r][c];

        // If already revealed or flagged, clicking may trigger chord if numbered
        if (cell.isRevealed) {
            if (cell.neighborMines > 0) {
                handleChording(r, c);
            }
            return;
        }

        if (cell.isFlagged) return;

        // First click setup
        if (!gameStarted) {
            gameStarted = true;
            generateMines(r, c);
            startTimer();
        }

        // Stepped on a mine -> Game Over!
        if (cell.isMine) {
            cell.isExploded = true;
            triggerGameOver(false);
            return;
        }

        // Reveal safe cell
        revealCell(r, c);
        checkWinCondition();
    }

    function revealCell(r, c) {
        const cell = board[r][c];
        if (cell.isRevealed || cell.isFlagged) return;

        cell.isRevealed = true;
        revealedCount++;

        // Update DOM element
        updateCellDOM(r, c);

        // If 0 neighbor mines, cascade flood-fill to neighbors
        if (cell.neighborMines === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                        const neighbor = board[nr][nc];
                        if (!neighbor.isRevealed && !neighbor.isFlagged) {
                            revealCell(nr, nc);
                        }
                    }
                }
            }
        }
    }

    function handleRightClick(r, c) {
        const cell = board[r][c];
        if (cell.isRevealed) return;

        if (!cell.isFlagged && !cell.isQuestion) {
            cell.isFlagged = true;
            flagsPlaced++;
        } else if (cell.isFlagged) {
            cell.isFlagged = false;
            cell.isQuestion = true;
            flagsPlaced--;
        } else {
            cell.isQuestion = false;
        }

        updateCounters();
        updateCellDOM(r, c);
    }

    // Chording: when clicking an already revealed numbered cell
    function handleChording(r, c) {
        const cell = board[r][c];
        if (!cell.isRevealed || cell.neighborMines === 0) return;

        // Count surrounding flags
        let surroundingFlags = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    if (board[nr][nc].isFlagged) surroundingFlags++;
                }
            }
        }

        // If flags match neighbor mines, reveal all unflagged neighbors!
        if (surroundingFlags === cell.neighborMines) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                        const neighbor = board[nr][nc];
                        if (!neighbor.isRevealed && !neighbor.isFlagged) {
                            if (neighbor.isMine) {
                                neighbor.isExploded = true;
                                triggerGameOver(false);
                                return;
                            } else {
                                revealCell(nr, nc);
                            }
                        }
                    }
                }
            }
            checkWinCondition();
        }
    }

    function updateCellDOM(r, c) {
        const cellEl = document.getElementById(`mineCell-${r}-${c}`);
        if (!cellEl) return;
        const cell = board[r][c];

        cellEl.className = 'minesweeper-cell';
        cellEl.innerHTML = '';
        delete cellEl.dataset.num;

        if (cell.isRevealed) {
            cellEl.classList.add('revealed');
            if (cell.isMine) {
                cellEl.innerHTML = MINE_SVG;
                if (cell.isExploded) cellEl.classList.add('exploded');
            } else if (cell.neighborMines > 0) {
                cellEl.dataset.num = cell.neighborMines;
                cellEl.textContent = cell.neighborMines;
            }
        } else {
            if (cell.isFlagged) {
                cellEl.innerHTML = FLAG_SVG;
            } else if (cell.isQuestion) {
                cellEl.textContent = '?';
            }
        }

        if (cell.isWrongFlag) {
            cellEl.classList.add('wrong-flag');
            cellEl.innerHTML = MINE_SVG;
        }
    }

    function checkWinCondition() {
        const totalSafeCells = rows * cols - totalMines;
        if (revealedCount === totalSafeCells && !gameOver) {
            triggerGameOver(true);
        }
    }

    function triggerGameOver(won) {
        stopTimer();
        gameOver = true;
        gameWon = won;

        if (won) {
            setSmiley('won');
            flagsPlaced = totalMines;
            updateCounters();

            // Auto-flag all remaining mines
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (board[r][c].isMine && !board[r][c].isFlagged) {
                        board[r][c].isFlagged = true;
                        updateCellDOM(r, c);
                    }
                }
            }
        } else {
            setSmiley('dead');

            // Reveal all mines and mark incorrect flags
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const cell = board[r][c];
                    if (cell.isMine && !cell.isFlagged) {
                        cell.isRevealed = true;
                        updateCellDOM(r, c);
                    } else if (!cell.isMine && cell.isFlagged) {
                        cell.isWrongFlag = true;
                        updateCellDOM(r, c);
                    }
                }
            }
        }
    }

    function setSmiley(state) {
        if (!smileyIconEl) return;
        smileyIconEl.className = `smiley-icon ${state}`;
    }

    function startTimer() {
        stopTimer();
        timerInterval = setInterval(() => {
            timerSeconds++;
            if (timerSeconds > 999) timerSeconds = 999;
            updateCounters();
        }, 1000);
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function updateCounters() {
        if (mineCounterEl) {
            const remaining = totalMines - flagsPlaced;
            mineCounterEl.textContent = formatLED(remaining);
        }
        if (timerEl) {
            timerEl.textContent = formatLED(timerSeconds);
        }
    }

    function formatLED(num) {
        if (num < 0) {
            const abs = Math.abs(num);
            return '-' + String(abs).padStart(2, '0');
        }
        return String(Math.min(999, num)).padStart(3, '0');
    }

    // Export to global scope
    window.setMinesweeperDifficulty = setDifficulty;
    window.restartMinesweeper = restartGame;
})();
