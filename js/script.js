/**
 * Sergio Andrés Aparicio Portfolio Engine
 * Dynamic Dual-OS Architecture: Windows XP (Luna Blue) & Windows 95
 */

let zIndex = 100;
let draggedElement = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let activeWindows = ['profileWindow'];
let currentOS = 'xp';
try {
    currentOS = localStorage.getItem('sergio_portfolio_os') || 'xp';
} catch (e) {
    currentOS = 'xp';
}
let soundMuted = false;

// Screensaver state
let idleTime = 0;
let screensaverActive = false;
let screensaverCanvas = null;
let screensaverCtx = null;
let screensaverAnimFrame = null;
let screensaverItems = [];

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

function init() {
    // Apply initial OS theme
    setOS(currentOS, false);

    // Initialize the Windows XP Welcome / Session Login Screen
    initWelcomeScreen();

    // Start system clock
    updateClock();
    setInterval(updateClock, 1000);

    // Setup idle timer for screensaver (90 seconds / 1.5 min)
    ['mousemove', 'mousedown', 'keydown', 'click', 'touchstart'].forEach(evt => {
        document.addEventListener(evt, resetIdleTimer, true);
    });

    setInterval(function() {
        idleTime++;
        if (idleTime >= 90 && !screensaverActive) {
            startScreensaver();
        }
    }, 1000);

    // Bind desktop icon actions
    document.querySelectorAll('.desktop-icon').forEach(icon => {
        let lastTap = 0;
        icon.addEventListener('click', function(e) {
            const now = Date.now();
            const isSelected = this.classList.contains('selected');
            const windowId = this.getAttribute('data-window');
            
            if (currentOS === 'xp') {
                playAudio('xpClickSound', 0.35);
            }

            // If already selected, or tapped quickly within 400ms, or on mobile screens (<= 768px)
            if (isSelected || (now - lastTap < 400) || window.innerWidth <= 768) {
                if (windowId) openWindow(windowId);
            } else {
                selectIcon(this);
            }
            lastTap = now;
            e.stopPropagation();
        });
        
        icon.addEventListener('dblclick', function() {
            const windowId = this.getAttribute('data-window');
            if (windowId) openWindow(windowId);
        });
    });

    // Bind Windows 95 start menu items
    document.querySelectorAll('#startMenu .start-menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const windowId = this.getAttribute('data-window');
            const dialogId = this.getAttribute('data-dialog');
            
            if (windowId) {
                openWindow(windowId);
            } else if (dialogId) {
                showDialog(dialogId);
            }
            toggleStartMenu();
        });
    });

    // Bind Windows XP start menu items (left and right columns)
    document.querySelectorAll('#startMenuXp .xp-start-item, #startMenuXp .xp-start-item-right').forEach(item => {
        item.addEventListener('click', function() {
            if (currentOS === 'xp') playAudio('xpClickSound', 0.35);

            const windowId = this.getAttribute('data-window');
            const dialogId = this.getAttribute('data-dialog');
            
            if (windowId) {
                openWindow(windowId);
            } else if (dialogId) {
                showDialog(dialogId);
            }
            toggleStartMenu();
        });
    });

    // Start Menu Action Buttons
    const xpStartLogoff = document.getElementById('xpStartLogoffBtn');
    if (xpStartLogoff) {
        xpStartLogoff.addEventListener('click', () => {
            toggleStartMenu();
            logOff();
        });
    }

    const xpStartShutdown = document.getElementById('xpStartShutdownBtn');
    if (xpStartShutdown) {
        xpStartShutdown.addEventListener('click', () => {
            toggleStartMenu();
            showShutdownDialog();
        });
    }

    const switchOsStart = document.getElementById('switchOsFromStart');
    if (switchOsStart) {
        switchOsStart.addEventListener('click', () => {
            toggleStartMenu();
            setOS('win95', true);
        });
    }

    const win95Logoff = document.getElementById('win95LogoffItem');
    if (win95Logoff) {
        win95Logoff.addEventListener('click', () => {
            toggleStartMenu();
            logOff();
        });
    }

    // System Tray OS Switcher & Sound Toggle
    const trayOsSwitchBtn = document.getElementById('trayOsSwitchBtn');
    if (trayOsSwitchBtn) {
        trayOsSwitchBtn.addEventListener('click', () => {
            const nextOS = (currentOS === 'xp') ? 'win95' : 'xp';
            setOS(nextOS, true);
        });
    }

    const traySoundToggle = document.getElementById('traySoundToggle');
    const traySoundIcon = document.getElementById('traySoundIcon');
    if (traySoundToggle) {
        traySoundToggle.addEventListener('click', () => {
            soundMuted = !soundMuted;
            if (traySoundIcon) traySoundIcon.textContent = soundMuted ? '🔇' : '🔊';
            traySoundToggle.title = soundMuted ? 'Sonido silenciado' : 'Sonido activado';
            if (!soundMuted) playAudio('xpClickSound', 0.4);
        });
    }

    // Shutdown Dialog actions
    const btnCancelShutdown = document.getElementById('btnCancelShutdown');
    if (btnCancelShutdown) btnCancelShutdown.addEventListener('click', hideShutdownDialog);

    const btnStandby = document.getElementById('btnStandby');
    if (btnStandby) {
        btnStandby.addEventListener('click', () => {
            hideShutdownDialog();
            startScreensaver();
        });
    }

    const btnShutdown = document.getElementById('btnShutdown');
    if (btnShutdown) {
        btnShutdown.addEventListener('click', () => {
            hideShutdownDialog();
            playAudio('xpShutdownSound', 0.85);
            setTimeout(logOff, 1500);
        });
    }

    const btnRestart = document.getElementById('btnRestart');
    if (btnRestart) {
        btnRestart.addEventListener('click', () => {
            hideShutdownDialog();
            playAudio('xpShutdownSound', 0.85);
            setTimeout(logOff, 1500);
        });
    }

    // Wire window control buttons dynamically
    document.querySelectorAll('.window').forEach(win => {
        const winId = win.id;
        const minBtn = win.querySelector('.window-controls .window-btn:nth-child(1)');
        const maxBtn = win.querySelector('.window-controls .window-btn:nth-child(2)');
        const closeBtn = win.querySelector('.window-controls .window-btn:nth-child(3)');
        
        if (minBtn) minBtn.addEventListener('click', () => {
            if (currentOS === 'xp') playAudio('xpClickSound', 0.3);
            minimizeWindow(winId);
        });
        if (maxBtn) maxBtn.addEventListener('click', () => {
            if (currentOS === 'xp') playAudio('xpClickSound', 0.3);
            maximizeWindow(winId);
        });
        if (closeBtn) closeBtn.addEventListener('click', () => {
            if (currentOS === 'xp') playAudio('xpClickSound', 0.3);
            closeWindow(winId);
        });
        
        // Also wire any 'Close' button inside content
        const contentCloseBtn = win.querySelector('.window-content button.btn:not(.btn-primary)');
        if (contentCloseBtn && contentCloseBtn.textContent.trim().toLowerCase() === 'close') {
            contentCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentOS === 'xp') playAudio('xpClickSound', 0.3);
                closeWindow(winId);
            });
        }
    });

    // Wire dialog control buttons
    document.querySelectorAll('.dialog-box').forEach(dialog => {
        const dialogId = dialog.id;
        const titleCloseBtn = dialog.querySelector('.window-titlebar > .window-btn');
        if (titleCloseBtn) {
            titleCloseBtn.addEventListener('click', () => {
                if (currentOS === 'xp') playAudio('xpClickSound', 0.3);
                closeDialog(dialogId);
            });
        }

        dialog.querySelectorAll('.dialog-content button').forEach(btn => {
            btn.addEventListener('click', () => {
                if (currentOS === 'xp') playAudio('xpClickSound', 0.3);
                closeDialog(dialogId);
            });
        });
    });

    // Wire special interactive elements (like the About button in profile window)
    const aboutBtn = document.querySelector('#profileWindow button.btn-primary');
    if (aboutBtn) {
        aboutBtn.addEventListener('click', () => showDialog('aboutDialog'));
    }

    // Wire tab buttons in windows (e.g. CampusDesk.exe)
    document.querySelectorAll('.win-tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (currentOS === 'xp') playAudio('xpClickSound', 0.25);
            const parent = this.closest('.window, .dialog-box');
            if (!parent) return;
            const targetId = this.getAttribute('data-tab');
            parent.querySelectorAll('.win-tab-btn').forEach(b => b.classList.remove('active'));
            parent.querySelectorAll('.win-tab-pane').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            const targetPane = parent.querySelector('#' + targetId);
            if (targetPane) targetPane.classList.add('active');
        });
    });

    // Wire portfolio contact link specifically
    const portfolioLink = document.getElementById('portfolioContactLink');
    if (portfolioLink) {
        portfolioLink.addEventListener('click', function(e) {
            e.preventDefault();
            showDialog('portfolioDialog');
        });
    }

    // Wire folder items to open skill detail modal
    document.querySelectorAll('.folder-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            if (currentOS === 'xp') playAudio('xpClickSound', 0.35);
            document.querySelectorAll('.folder-item').forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
            const skillKey = this.getAttribute('data-skill');
            if (skillKey) {
                showSkillDetail(skillKey);
            }
        });
    });

    // Click outside handler for start menu and desktop deselect
    document.addEventListener('click', function(e) {
        const startMenuXp = document.getElementById('startMenuXp');
        const startMenu95 = document.getElementById('startMenu');
        const startBtn = document.getElementById('startBtn');
        
        const inMenu = (startMenuXp && startMenuXp.contains(e.target)) || (startMenu95 && startMenu95.contains(e.target));
        const inBtn = startBtn && startBtn.contains(e.target);

        if (!inMenu && !inBtn) {
            if (startMenuXp) startMenuXp.classList.remove('active');
            if (startMenu95) startMenu95.classList.remove('active');
            if (startBtn) startBtn.classList.remove('active');
        }
        
        if (e.target.classList.contains('desktop')) {
            document.querySelectorAll('.desktop-icon').forEach(icon => {
                icon.classList.remove('selected');
            });
        }
    });

    // Escape key closes active dialogs
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.dialog-box').forEach(dialog => {
                dialog.classList.remove('active');
            });
        }
    });

    // Start drag event listener (Mouse)
    document.addEventListener('mousedown', function(e) {
        if (window.innerWidth <= 768) return; // Windows are full-frame on mobile
        const titlebar = e.target.closest('.window-titlebar');
        if (!titlebar) return;
        
        // Ignore if clicking window buttons
        if (e.target.closest('.window-btn') || e.target.closest('button')) return;
        
        const win = titlebar.closest('.window, .dialog-box');
        if (!win) return;
        
        draggedElement = win;
        const rect = win.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        
        bringToFront(win.id);
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
    });

    // Start drag event listener (Touch for tablets > 768px)
    document.addEventListener('touchstart', function(e) {
        if (window.innerWidth <= 768) return;
        const titlebar = e.target.closest('.window-titlebar');
        if (!titlebar) return;
        if (e.target.closest('.window-btn') || e.target.closest('button')) return;
        const win = titlebar.closest('.window, .dialog-box');
        if (!win) return;
        
        draggedElement = win;
        const rect = win.getBoundingClientRect();
        const touch = e.touches[0];
        dragOffsetX = touch.clientX - rect.left;
        dragOffsetY = touch.clientY - rect.top;
        bringToFront(win.id);
        
        document.addEventListener('touchmove', dragTouch, { passive: false });
        document.addEventListener('touchend', stopDragTouch);
    }, { passive: true });

    // Handle viewport resize for responsiveness
    window.addEventListener('resize', handleWindowResize);

    // Render initially active windows in the taskbar
    activeWindows.forEach(winId => {
        addToTaskbar(winId);
    });
}

// Clock updates
function updateClock() {
    const now = new Date();
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();
    
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    
    // Formatting: Responsive with separate date and time spans
    const clockEl = document.getElementById('clock');
    if (clockEl) {
        clockEl.innerHTML = `<span class="clock-date">${dayName}, ${day} de ${monthName} de ${year} - </span><span class="clock-time">${hours}:${minutes} ${ampm}</span>`;
    }
}

// Window Operations
function openWindow(windowId) {
    const windowEl = document.getElementById(windowId);
    if (!windowEl) return;
    
    windowEl.classList.add('active');
    bringToFront(windowId);

    // Keep within bounds on desktop and tablets
    if (window.innerWidth > 768) {
        const rect = windowEl.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            windowEl.style.left = Math.max(10, window.innerWidth - rect.width - 20) + 'px';
        }
        if (rect.bottom > window.innerHeight - 30) {
            windowEl.style.top = Math.max(10, window.innerHeight - rect.height - 40) + 'px';
        }
    }
    
    if (!activeWindows.includes(windowId)) {
        activeWindows.push(windowId);
        addToTaskbar(windowId);
    }
}

function closeWindow(windowId) {
    const windowEl = document.getElementById(windowId);
    if (!windowEl) return;
    
    windowEl.classList.remove('active');
    activeWindows = activeWindows.filter(w => w !== windowId);
    removeFromTaskbar(windowId);
}

function minimizeWindow(windowId) {
    const windowEl = document.getElementById(windowId);
    if (!windowEl) return;
    
    windowEl.classList.remove('active');
    const taskbarItem = document.getElementById('taskbar-' + windowId);
    if (taskbarItem) {
        taskbarItem.classList.remove('active');
    }
}

function maximizeWindow(windowId) {
    const windowEl = document.getElementById(windowId);
    if (!windowEl) return;
    
    if (windowEl.style.width === '100%') {
        windowEl.style.width = windowEl.getAttribute('data-prev-width') || '500px';
        windowEl.style.height = windowEl.getAttribute('data-prev-height') || 'auto';
        windowEl.style.top = windowEl.getAttribute('data-prev-top') || '50px';
        windowEl.style.left = windowEl.getAttribute('data-prev-left') || '100px';
        windowEl.style.transform = '';
    } else {
        windowEl.setAttribute('data-prev-width', windowEl.style.width || '500px');
        windowEl.setAttribute('data-prev-height', windowEl.style.height || 'auto');
        const rect = windowEl.getBoundingClientRect();
        windowEl.setAttribute('data-prev-top', windowEl.style.top || (rect.top + 'px'));
        windowEl.setAttribute('data-prev-left', windowEl.style.left || (rect.left + 'px'));
        
        windowEl.style.width = '100%';
        windowEl.style.height = 'calc(100vh - 30px)';
        windowEl.style.top = '0';
        windowEl.style.left = '0';
    }
}

function bringToFront(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    zIndex++;
    el.style.zIndex = zIndex;
    
    // Focus styling
    if (el.classList.contains('window')) {
        document.querySelectorAll('.window').forEach(w => {
            const tb = w.querySelector('.window-titlebar');
            if (tb) tb.classList.add('inactive');
        });
        const activeTb = el.querySelector('.window-titlebar');
        if (activeTb) activeTb.classList.remove('inactive');
        
        document.querySelectorAll('.taskbar-item').forEach(t => t.classList.remove('active'));
        const taskbarItem = document.getElementById('taskbar-' + elementId);
        if (taskbarItem) {
            taskbarItem.classList.add('active');
        }
    }
}

function addToTaskbar(windowId) {
    const taskbarItems = document.getElementById('taskbarItems');
    if (!taskbarItems) return;
    
    if (!document.getElementById('taskbar-' + windowId)) {
        const item = document.createElement('div');
        item.className = 'taskbar-item';
        item.id = 'taskbar-' + windowId;
        item.onclick = () => {
            const win = document.getElementById(windowId);
            if (win.classList.contains('active') && win.style.zIndex == zIndex) {
                minimizeWindow(windowId);
            } else {
                openWindow(windowId);
            }
        };
        
        let iconSrc = 'assets/icons/profile.svg';
        let title = 'Document';
        
        if (windowId === 'profileWindow') { iconSrc = 'assets/icons/profile.svg'; title = 'Profile.doc'; }
        else if (windowId === 'experienceWindow') { iconSrc = 'assets/icons/experience.svg'; title = 'Experience.exe'; }
        else if (windowId === 'skillsWindow') { iconSrc = 'assets/icons/skills.svg'; title = 'Skills.cpl'; }
        else if (windowId === 'campusdeskWindow') { iconSrc = 'assets/icons/retro/springboot.svg'; title = 'CampusDesk.exe'; }
        else if (windowId === 'contactWindow') { iconSrc = 'assets/icons/contact.svg'; title = 'Contact.lnk'; }
        else if (windowId === 'solitaireWindow') { iconSrc = 'assets/icons/solitaire.svg'; title = 'Solitaire'; }
        else if (windowId === 'skillsFolderWindow') { iconSrc = 'assets/icons/folder.svg'; title = 'Habilidades'; }
        else if (windowId === 'minesweeperWindow') { iconSrc = 'assets/icons/minesweeper.svg'; title = 'Buscaminas'; }
        
        item.innerHTML = `<img src="${iconSrc}" alt=""> <span>${title}</span>`;
        taskbarItems.appendChild(item);
    }
}

function removeFromTaskbar(windowId) {
    const item = document.getElementById('taskbar-' + windowId);
    if (item) {
        item.remove();
    }
}

// Dialog Operations
function showDialog(dialogId) {
    const dialog = document.getElementById(dialogId);
    if (!dialog) return;
    
    dialog.classList.add('active');
    bringToFront(dialogId);
    
    // Center dialog in viewport
    if (window.innerWidth <= 768) {
        dialog.style.left = '50%';
        dialog.style.top = '50%';
        dialog.style.transform = 'translate(-50%, -50%)';
    } else {
        dialog.style.transform = '';
        const rect = dialog.getBoundingClientRect();
        dialog.style.left = `${Math.max(10, (window.innerWidth - rect.width) / 2)}px`;
        dialog.style.top = `${Math.max(10, (window.innerHeight - rect.height) / 2)}px`;
    }
}

function closeDialog(dialogId) {
    const dialog = document.getElementById(dialogId);
    if (dialog) {
        dialog.classList.remove('active');
    }
}

// Start menu trigger
function toggleStartMenu() {
    const startMenuXp = document.getElementById('startMenuXp');
    const startMenu95 = document.getElementById('startMenu');
    const startBtn = document.getElementById('startBtn');
    const activeMenu = (currentOS === 'xp') ? startMenuXp : startMenu95;
    const inactiveMenu = (currentOS === 'xp') ? startMenu95 : startMenuXp;

    if (inactiveMenu) inactiveMenu.classList.remove('active');
    if (activeMenu && startBtn) {
        const willBeActive = !activeMenu.classList.contains('active');
        activeMenu.classList.toggle('active', willBeActive);
        startBtn.classList.toggle('active', willBeActive);
        if (willBeActive && currentOS === 'xp') {
            playAudio('xpClickSound', 0.4);
        }
    }
}

// Desktop icon selection styling
function selectIcon(element) {
    document.querySelectorAll('.desktop-icon').forEach(icon => {
        icon.classList.remove('selected');
    });
    element.classList.add('selected');
}

// Drag operations
function drag(e) {
    if (draggedElement) {
        let newX = e.clientX - dragOffsetX;
        let newY = e.clientY - dragOffsetY;
        
        // Keep within viewport boundaries
        const maxX = Math.max(0, window.innerWidth - 60);
        const maxY = Math.max(0, window.innerHeight - 30 - 30);
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        
        draggedElement.style.left = newX + 'px';
        draggedElement.style.top = newY + 'px';
    }
}

function stopDrag() {
    draggedElement = null;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
}

function dragTouch(e) {
    if (draggedElement && e.touches.length > 0) {
        e.preventDefault();
        drag(e.touches[0]);
    }
}

function stopDragTouch() {
    draggedElement = null;
    document.removeEventListener('touchmove', dragTouch);
    document.removeEventListener('touchend', stopDragTouch);
}

function handleWindowResize() {
    // If mobile, center dialogs and reset positions if needed
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.dialog-box.active').forEach(dialog => {
            dialog.style.left = '50%';
            dialog.style.top = '50%';
            dialog.style.transform = 'translate(-50%, -50%)';
        });
    } else {
        // Ensure desktop windows don't hang outside newly shrunk viewport
        document.querySelectorAll('.window.active').forEach(win => {
            const rect = win.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                win.style.left = Math.max(10, window.innerWidth - rect.width - 20) + 'px';
            }
            if (rect.bottom > window.innerHeight - 30) {
                win.style.top = Math.max(10, window.innerHeight - rect.height - 40) + 'px';
            }
        });
    }
}

// Export functions to global scope to handle inline events in HTML if any remain
window.openWindow = openWindow;
window.closeWindow = closeWindow;
window.minimizeWindow = minimizeWindow;
window.maximizeWindow = maximizeWindow;
window.showDialog = showDialog;
window.closeDialog = closeDialog;
window.bringToFront = bringToFront;
window.toggleStartMenu = toggleStartMenu;
window.selectIcon = selectIcon;

// Screensaver functions
function resetIdleTimer() {
    if (screensaverActive) {
        stopScreensaver();
    }
    idleTime = 0;
}

function startScreensaver() {
    screensaverActive = true;
    
    // Create screensaver overlay
    const overlay = document.createElement('div');
    overlay.id = 'screensaver-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = '#000000';
    overlay.style.zIndex = '99999';
    overlay.style.cursor = 'none'; // Hide cursor
    
    screensaverCanvas = document.createElement('canvas');
    screensaverCanvas.width = window.innerWidth;
    screensaverCanvas.height = window.innerHeight;
    overlay.appendChild(screensaverCanvas);
    document.body.appendChild(overlay);
    
    screensaverCtx = screensaverCanvas.getContext('2d');
    
    // Listen for window resize
    window.addEventListener('resize', resizeScreensaverCanvas);
    
    initScreensaverItems();
    loopScreensaver();
}

function resizeScreensaverCanvas() {
    if (screensaverActive && screensaverCanvas) {
        screensaverCanvas.width = window.innerWidth;
        screensaverCanvas.height = window.innerHeight;
    }
}

function initScreensaverItems() {
    screensaverItems = [];
    // Add stars (background depth)
    for (let i = 0; i < 80; i++) {
        screensaverItems.push({
            type: 'star',
            x: (Math.random() - 0.5) * window.innerWidth * 1.5,
            y: (Math.random() - 0.5) * window.innerHeight * 1.5,
            z: Math.random() * 1000,
            speed: 8 + Math.random() * 12
        });
    }
    // Add Windows 95 Flying Logos
    for (let i = 0; i < 12; i++) {
        screensaverItems.push({
            type: 'logo',
            x: (Math.random() - 0.5) * window.innerWidth * 0.4,
            y: (Math.random() - 0.5) * window.innerHeight * 0.4,
            z: Math.random() * 1000,
            speed: 4 + Math.random() * 6,
            size: 15 + Math.random() * 12
        });
    }
}

function loopScreensaver() {
    if (!screensaverActive || !screensaverCanvas || !screensaverCtx) return;
    
    screensaverCtx.fillStyle = '#000000';
    screensaverCtx.fillRect(0, 0, screensaverCanvas.width, screensaverCanvas.height);
    
    const cx = screensaverCanvas.width / 2;
    const cy = screensaverCanvas.height / 2;
    const fov = 350;
    
    screensaverItems.forEach(item => {
        item.z -= item.speed;
        if (item.z <= 0) {
            item.z = 1000;
            item.x = (Math.random() - 0.5) * screensaverCanvas.width * (item.type === 'logo' ? 0.3 : 1.5);
            item.y = (Math.random() - 0.5) * screensaverCanvas.height * (item.type === 'logo' ? 0.3 : 1.5);
        }
        
        const px = cx + (item.x / item.z) * fov;
        const py = cy + (item.y / item.z) * fov;
        
        // Reset item if projected coordinate is way out of bounds
        if (px < -100 || px > screensaverCanvas.width + 100 || py < -100 || py > screensaverCanvas.height + 100) {
            item.z = 1000;
            item.x = (Math.random() - 0.5) * screensaverCanvas.width * (item.type === 'logo' ? 0.3 : 1.5);
            item.y = (Math.random() - 0.5) * screensaverCanvas.height * (item.type === 'logo' ? 0.3 : 1.5);
            return;
        }
        
        if (item.type === 'star') {
            const size = (1 - item.z / 1000) * 2.5;
            screensaverCtx.fillStyle = '#ffffff';
            screensaverCtx.beginPath();
            screensaverCtx.arc(px, py, size > 0 ? size : 0.1, 0, Math.PI * 2);
            screensaverCtx.fill();
        } else {
            const size = (fov / item.z) * item.size;
            if (size > 2) {
                drawScreensaverWindowsLogo(screensaverCtx, px, py, size);
            }
        }
    });
    
    screensaverAnimFrame = requestAnimationFrame(loopScreensaver);
}

function drawScreensaverWindowsLogo(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.lineWidth = Math.max(1, size / 15);
    ctx.strokeStyle = '#000000';
    
    const qSize = size / 2;
    
    // Top Left: Red
    ctx.fillStyle = '#ff5555';
    ctx.beginPath();
    ctx.moveTo(-qSize, -qSize);
    ctx.quadraticCurveTo(-qSize/2, -qSize - (qSize*0.1), 0, -qSize);
    ctx.lineTo(0, 0);
    ctx.quadraticCurveTo(-qSize/2, -(qSize*0.1), -qSize, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Top Right: Green
    ctx.fillStyle = '#55ff55';
    ctx.beginPath();
    ctx.moveTo(0, -qSize);
    ctx.quadraticCurveTo(qSize/2, -qSize + (qSize*0.1), qSize, -qSize + (qSize*0.05));
    ctx.lineTo(qSize, 1);
    ctx.quadraticCurveTo(qSize/2, (qSize*0.1), 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Bottom Left: Blue
    ctx.fillStyle = '#5555ff';
    ctx.beginPath();
    ctx.moveTo(-qSize, 0);
    ctx.quadraticCurveTo(-qSize/2, -(qSize*0.1), 0, 0);
    ctx.lineTo(0, qSize);
    ctx.quadraticCurveTo(-qSize/2, qSize - (qSize*0.1), -qSize, qSize);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Bottom Right: Yellow
    ctx.fillStyle = '#ffff55';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(qSize/2, (qSize*0.1), qSize, 1);
    ctx.lineTo(qSize, qSize + (qSize*0.05));
    ctx.quadraticCurveTo(qSize/2, qSize + (qSize*0.1), 0, qSize);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
}

function stopScreensaver() {
    screensaverActive = false;
    if (screensaverAnimFrame) {
        cancelAnimationFrame(screensaverAnimFrame);
        screensaverAnimFrame = null;
    }
    window.removeEventListener('resize', resizeScreensaverCanvas);
    const overlay = document.getElementById('screensaver-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// ============================================================
// Technical Skills Dictionary & Detail Modal (Windows 95)
// ============================================================
const SKILL_DETAILS = {
    python: {
        title: 'Python',
        category: 'Lenguajes de Programación & Backend',
        icon: 'assets/icons/retro/python.svg',
        level: 'Avanzado / Core Backend',
        description: 'Desarrollo backend y análisis de datos utilizando Python con enfoque estricto en Programación Orientada a Objetos (POO), principios SOLID, modularidad y estructuras de datos.',
        skills: [
            'Programación Orientada a Objetos (POO) avanzada y encapsulamiento',
            'Estructuras de datos, algoritmos de búsqueda y manipulación de colecciones',
            'Desarrollo modular de paquetes y scripts de automatización',
            'Manejo de excepciones robusto y validación de tipos',
            'Generación automatizada de reportes y balances analíticos'
        ],
        projects: 'Aplicación de Control Financiero Personal (Gestor Financiero)'
    },
    javascript: {
        title: 'JavaScript (ES6+)',
        category: 'Lenguajes de Programación & Fullstack',
        icon: 'assets/icons/retro/javascript.svg',
        level: 'Avanzado / Vanilla Specialist',
        description: 'Especialista en JavaScript moderno Vanilla (ES6+) sin dependencias de frameworks externos. Arquitectura modular de eventos, manipulación avanzada de DOM y programación asíncrona.',
        skills: [
            'Manipulación reactiva del DOM y gestión de eventos del navegador',
            'Programación asíncrona (Async/Await, Promises, Fetch API)',
            'Arquitectura orientada a componentes modulares e IIFE',
            'Gestión de ventanas dinámicas, física canvas (juego Solitario) y drag-and-drop nativo',
            'Integración con Web APIs nativas del navegador'
        ],
        projects: 'NeoMetro (Hackatón), Smart City Fix, CampusBuild, Portafolio Retro Win95'
    },
    java: {
        title: 'Java',
        category: 'Lenguajes de Programación & Backend',
        icon: 'assets/icons/retro/java.svg',
        level: 'Avanzado / Java 21 LTS Enterprise',
        description: 'Construcción de aplicaciones empresariales robustas y escalables aplicando POO avanzada, arquitectura limpia, diseño de dominio y persistencia relacional.',
        skills: [
            'Java 21 LTS (records, pattern matching, virtual threads y API moderna)',
            'Programación Orientada a Objetos, herencia, polimorfismo e interfaces',
            'Patrones de diseño de software y principios SOLID',
            'Java Collections Framework (List, Map, Set) y Streams API',
            'Gestión de excepciones empresariales, DTOs y logs de auditoría',
            'Modelado de dominios complejos con Spring Boot y JPA/Hibernate'
        ],
        projects: 'CAMPUSDESK (Spring Boot 4.1.1 + Java 21), RapidExpress (Gestión de Flotas)'
    },
    springboot: {
        title: 'Spring Boot',
        category: 'Framework Backend Java Enterprise',
        icon: 'assets/icons/retro/springboot.svg',
        level: 'Avanzado / Spring Boot 4.1.1 & Security',
        description: 'Desarrollo de microservicios y APIs RESTful desacopladas, sin estado (stateless) y de alto rendimiento utilizando Spring Boot 4.1.1 y el ecosistema Spring Framework.',
        skills: [
            'Arquitectura stateless y filtros de autenticación JWT simétricos HMAC256',
            'Control de acceso granular RBAC con permisos dinámicos y @PreAuthorize',
            'Persistencia y ORM con Spring Data JPA / Hibernate (ddl-auto=update)',
            'Mapeo de DTOs en compilación con MapStruct 1.5.5 y optimización con Lombok',
            'Documentación interactiva con Springdoc OpenAPI 3 y Swagger UI',
            'Testing automatizado con Spring Boot Starter Test, Spring Security Test y H2',
            'Automatización de ciclo de vida con Gradle 8.14.3 Wrapper'
        ],
        projects: 'CAMPUSDESK - Plataforma de Mesa de Ayuda y Gestión de Tickets'
    },
    r: {
        title: 'R',
        category: 'Ciencia de Datos & Bioinformática',
        icon: 'assets/icons/retro/r.svg',
        level: 'Avanzado / Data Cleaning & Analysis',
        description: 'Análisis estadístico riguroso, transformación de datos multidimensionales, validación taxonómica y estructuración bajo estándares internacionales.',
        skills: [
            'Estructuración, limpieza y validación de bases de datos masivas',
            'Implementación del estándar biológico Darwin Core (DwC)',
            'Automatización de pipelines de depuración previa a indexación en GBIF',
            'Generación de estadísticas descriptivas y visualización de datos',
            'Auditoría y control de calidad de datos científicos'
        ],
        projects: 'Digitalización y Gestión de Datos Taxonómicos (UIS)'
    },
    postgresql: {
        title: 'PostgreSQL',
        category: 'Bases de Datos Relacionales',
        icon: 'assets/icons/retro/postgresql.svg',
        level: 'Intermedio - Avanzado / SQL Relacional',
        description: 'Administración, modelado y optimización de bases de datos relacionales avanzadas, asegurando integridad transaccional ACID y alta fidelidad de información.',
        skills: [
            'Diseño de esquemas relacionales normalizados y sincronización ddl-auto',
            'Restricciones de integridad referencial, claves foráneas e índices únicos',
            'Consultas complejas con JOINs, CTEs y funciones de agregación',
            'Transacciones ACID y consistencia de datos críticos de negocio',
            'Integración nativa con Hibernate ORM y Spring Data JPA'
        ],
        projects: 'CAMPUSDESK (Esquema relacional ddl-auto=update), Coworking Management'
    },
    mysql: {
        title: 'MySQL',
        category: 'Bases de Datos Relacionales',
        icon: 'assets/icons/retro/mysql.svg',
        level: 'Intermedio - Avanzado / Modelado ER',
        description: 'Diseño e implementación de bases de datos relacionales para soluciones comerciales y administrativas, con control estricto de concurrencia y consultas analíticas.',
        skills: [
            'Modelado entidad-relación (ER) y normalización hasta 3FN',
            'Gestión de reservas de recursos concurrentes en tiempo real',
            'Procedimientos almacenados, vistas analíticas y triggers',
            'Seguridad de usuarios, roles y control de privilegios',
            'Consultas de reportería analítica y facturación automatizada'
        ],
        projects: 'Sistema de Gestión Coworking'
    },
    n8n: {
        title: 'n8n',
        category: 'Automatización & Orquestación Backend',
        icon: 'assets/icons/retro/n8n.svg',
        level: 'Avanzado / Workflow Automation Specialist',
        description: 'Diseño e implementación de flujos de trabajo backend automáticos y reactivos para captura, transformación y canalización de datos en tiempo real.',
        skills: [
            'Automatización de flujos de eventos e ingesta en tiempo real vía Webhooks',
            'Orquestación de servicios web y consumo de APIs REST de terceros',
            'Transformación y enriquecimiento de payloads JSON complejos con nodos de código',
            'Canalización y enrutamiento inteligente de incidencias públicas y alertas',
            'Manejo de errores, reintentos automáticos y registro de auditoría'
        ],
        projects: 'NeoMetro (Hackatón), Smart City Fix'
    },
    html5: {
        title: 'HTML5',
        category: 'Desarrollo Web & Frontend',
        icon: 'assets/icons/retro/html5.svg',
        level: 'Avanzado / Semántico & Accesible',
        description: 'Maquetación web semántica moderna de alta fidelidad, orientada a la accesibilidad (a11y), SEO técnico y máximo rendimiento de carga.',
        skills: [
            'Estructuración semántica rigurosa con etiquetas HTML5 nativas',
            'Integración de APIs multimedia del navegador (Audio, Video, Canvas)',
            'Accesibilidad web y optimización de jerarquías de contenido',
            'Formularios avanzados con validaciones nativas',
            'Diseño de layouts de alta fidelidad sin frameworks pesados'
        ],
        projects: 'Music Stream, CampusBuild, Portafolio Retro Win95'
    },
    css3: {
        title: 'CSS3',
        category: 'Desarrollo Web & Frontend',
        icon: 'assets/icons/retro/css3.svg',
        level: 'Avanzado / Vanilla CSS & Retro UI',
        description: 'Dominio exhaustivo de CSS3 puro sin dependencias. Creación de sistemas de diseño visual, efectos de profundidad 3D, interfaces retro y responsive design.',
        skills: [
            'Sistemas de diseño basados en Custom Properties (Variables CSS)',
            'Layouts complejos con CSS Grid y Flexbox',
            'Estética retro Windows 95: biseles 3D, sombreados inset/outset, relieves táctiles',
            'Micro-animaciones, transiciones suaves y estados interactivos',
            'Media Queries para diseño responsivo adaptativo'
        ],
        projects: 'Portafolio Retro Win95, Music Stream, CampusBuild'
    },
    git: {
        title: 'Git',
        category: 'Control de Versiones',
        icon: 'assets/icons/retro/git.svg',
        level: 'Avanzado / Control de Versiones',
        description: 'Control de versiones distribuido profesional, trazabilidad de código, gestión de ramas y flujos de trabajo colaborativos eficientes.',
        skills: [
            'Flujos de trabajo basados en ramas (GitFlow, feature branches)',
            'Convención de commits semánticos y mensajes descriptivos',
            'Resolución de conflictos de fusión (merge & rebase)',
            'Trazabilidad histórica de código, cherry-picking y stash',
            'Etiquetado de versiones (tags y releases)'
        ],
        projects: 'Control de versiones transversal en todos los proyectos'
    },
    github: {
        title: 'GitHub',
        category: 'Colaboración & CI/CD',
        icon: 'assets/icons/retro/github.svg',
        level: 'Avanzado / Gestión de Repositorios',
        description: 'Administración de repositorios remotos de código abierto y privados, revisión de código por pares y publicación de proyectos.',
        skills: [
            'Gestión integral de repositorios remotos y colaboración en equipo',
            'Flujo de Pull Requests con code review riguroso',
            'Gestión de Issues, hitos (milestones) y tableros Kanban de proyectos',
            'Integración continua con plataformas de despliegue (Vercel, Coolify)',
            'Documentación profesional de repositorios (README, Walkthroughs)'
        ],
        projects: 'Catálogo de Repositorios Públicos en GitHub'
    },
    docker: {
        title: 'Docker',
        category: 'Cloud, DevOps & Contenedores',
        icon: 'assets/icons/retro/docker.svg',
        level: 'Intermedio / Contenedorización',
        description: 'Contenedorización de aplicaciones y bases de datos para garantizar entornos de desarrollo y producción consistentes, aislados y reproducibles.',
        skills: [
            'Creación y optimización de imágenes con Dockerfile',
            'Gestión de contenedores, ciclo de vida, volúmenes de datos y redes',
            'Composición de servicios multi-contenedor con Docker Compose',
            'Despliegue de bases de datos (PostgreSQL, MySQL) en contenedores',
            'Integración con plataformas de orquestación y despliegue (Coolify)'
        ],
        projects: 'Entornos de Despliegue y Pruebas en Contenedores'
    },
    coolify: {
        title: 'Coolify',
        category: 'Cloud & Self-Hosted PaaS',
        icon: 'assets/icons/retro/coolify.svg',
        level: 'Intermedio / Despliegue Autónomo',
        description: 'Gestión y despliegue autónomo de aplicaciones, servicios backend y bases de datos en infraestructura en la nube autohospedada.',
        skills: [
            'Despliegue automatizado de aplicaciones web y APIs desde repositorios Git',
            'Aprovisionamiento y administración de bases de datos relacionales en la nube',
            'Configuración de variables de entorno y certificados SSL automáticos',
            'Monitoreo de recursos de servidor, logs y reinicio de servicios',
            'Alternativa open-source a Heroku / Render para control total de infraestructura'
        ],
        projects: 'Infraestructura de Hosting y Servicios Propios'
    },
    vercel: {
        title: 'Vercel',
        category: 'Cloud & Despliegue Frontend',
        icon: 'assets/icons/retro/vercel.svg',
        level: 'Intermedio - Avanzado / CI/CD Hosting',
        description: 'Despliegue continuo de aplicaciones frontend y soluciones web en red de entrega de contenido (Edge CDN) con integración automática.',
        skills: [
            'Despliegues automatizados mediante Webhooks conectados a GitHub',
            'Configuración de dominios personalizados y DNS seguro',
            'Optimización de tiempos de carga globales en red Edge CDN',
            'Entornos de previsualización (Preview Deployments) por cada Pull Request',
            'Monitoreo de Core Web Vitals y métricas de rendimiento en vivo'
        ],
        projects: 'Despliegues en producción de portafolio y aplicaciones web'
    },
    hostinger: {
        title: 'Hostinger',
        category: 'Hosting & Servidores Web',
        icon: 'assets/icons/retro/hostinger.svg',
        level: 'Intermedio / Gestión de Hosting',
        description: 'Administración de servidores web, gestión de dominios, configuraciones DNS, certificados de seguridad SSL y despliegues estáticos/dinámicos.',
        skills: [
            'Configuración y gestión de zonas DNS, subdominios y redirecciones',
            'Instalación y renovación de certificados de seguridad SSL / TLS',
            'Gestión de archivos vía FTP/SFTP y administración de cuentas de hosting',
            'Configuración de correos corporativos y registros SPF/DKIM',
            'Despliegue y mantenimiento de sitios web en producción'
        ],
        projects: 'Alojamiento de dominios y servicios en producción'
    },
    bash: {
        title: 'Bash',
        category: 'Sistemas Operativos & Terminal',
        icon: 'assets/icons/retro/bash.svg',
        level: 'Intermedio - Avanzado / Shell Scripting',
        description: 'Automatización de tareas, procesamiento de texto en línea de comandos y administración de sistemas en entornos Unix/Linux.',
        skills: [
            'Automatización de tareas repetitivas mediante scripts en Bash (.sh)',
            'Manipulación y procesamiento de flujos de texto (grep, sed, awk, cut)',
            'Tuberías (pipes), redirecciones de entrada/salida y control de flujos',
            'Gestión de procesos, variables de entorno y permisos de archivos (chmod/chown)',
            'Navegación ágil por terminal y ejecución de comandos remotos vía SSH'
        ],
        projects: 'Automatizaciones de entorno y procesamiento de archivos'
    },
    powershell: {
        title: 'PowerShell',
        category: 'Sistemas Operativos & Terminal',
        icon: 'assets/icons/retro/powershell.svg',
        level: 'Intermedio / Scripting Windows',
        description: 'Scripting orientado a objetos en entornos Windows, administración de archivos, automatización de tareas y configuración de herramientas de desarrollo.',
        skills: [
            'Scripting interactivo y ejecución de cmdlets orientados a objetos',
            'Automatización de preparación de workspaces y gestión de procesos',
            'Filtrado y transformación de datos en pipelines con Where-Object y Select-Object',
            'Integración con herramientas CLI de desarrollo (Node, Python, Git)',
            'Pruebas y monitoreo de conectividad de servicios locales y endpoints'
        ],
        projects: 'Automatización y administración de entorno de desarrollo local'
    },
    linux: {
        title: 'Linux',
        category: 'Sistemas Operativos',
        icon: 'assets/icons/retro/linux.svg',
        level: 'Intermedio / Administración & Servidores',
        description: 'Uso y administración de sistemas operativos Linux (Ubuntu, Debian) para desarrollo de software, despliegue de contenedores y servicios en la nube.',
        skills: [
            'Administración de paquetes (apt) y configuración de dependencias de desarrollo',
            'Gestión de servicios del sistema (systemd, service) y monitoreo de recursos (top, htop)',
            'Estructura de directorios de Linux, permisos de usuario y seguridad básica',
            'Conexión segura y administración remota de servidores mediante SSH',
            'Entorno nativo para ejecución de contenedores Docker y flujos automatizados'
        ],
        projects: 'Entornos de Servidores y Contenedores'
    },
    vscode: {
        title: 'Visual Studio Code',
        category: 'Entornos de Desarrollo (IDE)',
        icon: 'assets/icons/retro/vscode.svg',
        level: 'Avanzado / IDE Principal',
        description: 'Entorno de desarrollo integrado principal, optimizado para desarrollo fullstack con extensiones de productividad, depuradores integrados y Git.',
        skills: [
            'Configuración avanzada de workspaces, atajos de teclado y snippets personalizados',
            'Uso de herramientas integradas de depuración (debugging con breakpoints)',
            'Gestión de extensiones esenciales (Linter, Prettier, GitLens, Python, Java tools)',
            'Integración fluida con terminales múltiples (Bash, PowerShell, WSL)',
            'Control de versiones y resolución de diffs directamente en el editor'
        ],
        projects: 'Entorno de desarrollo diario en todos los proyectos de software'
    },
    ai: {
        title: 'IA Generativa',
        category: 'Herramientas de Productividad & AI',
        icon: 'assets/icons/retro/ai.svg',
        level: 'Avanzado / AI-Assisted Engineering',
        description: 'Aplicación estratégica y rigurosa de modelos de lenguaje e inteligencia artificial generativa para acelerar el desarrollo de software de alta calidad.',
        skills: [
            'Pair programming asistido por IA para aceleración de flujos de código',
            'Generación y diseño de casos de prueba unitarios e integración',
            'Refactorización estructurada y optimización de complejidad algorítmica',
            'Investigación y adopción rápida de nuevas librerías y tecnologías',
            'Auditoría y análisis crítico de sugerencias de código para asegurar buenas prácticas'
        ],
        projects: 'Optimización transversal en el ciclo de vida del software'
    },
    gbif: {
        title: 'GBIF',
        category: 'Bases de Datos & Estándares Globales',
        icon: 'assets/icons/retro/gbif.svg',
        level: 'Avanzado / Estandarización de Datos',
        description: 'Estandarización y publicación de datos de biodiversidad en la Global Biodiversity Information Facility, garantizando interoperabilidad global.',
        skills: [
            'Mapeo y transformación de bases de datos al estándar Darwin Core (DwC)',
            'Validación taxonómica rigurosa y limpieza de coordenadas geográficas',
            'Procesamiento de datos con scripts especializados en R',
            'Publicación formal de conjuntos de datos con metadatos estructurados',
            'Garantía de calidad e integridad de datos científicos para consulta internacional'
        ],
        projects: 'Liderazgo en Digitalización y Publicación GBIF (UIS)'
    }
};

function showSkillDetail(skillKey) {
    const data = SKILL_DETAILS[skillKey];
    if (!data) return;

    const iconEl = document.getElementById('skillDetailIcon');
    const titleEl = document.getElementById('skillDetailTitle');
    const catEl = document.getElementById('skillDetailCategory');
    const bodyEl = document.getElementById('skillDetailBody');
    const titlebarText = document.getElementById('skillDetailTitlebar');

    if (iconEl) iconEl.src = data.icon;
    if (titleEl) titleEl.textContent = data.title;
    if (catEl) catEl.textContent = `${data.category} • ${data.level}`;
    if (titlebarText) titlebarText.textContent = `Propiedades de ${data.title}`;

    if (bodyEl) {
        let skillsListHtml = data.skills.map(s => `<li>${s}</li>`).join('');
        let projectsHtml = data.projects ? `
            <div style="margin-top: 10px; padding: 6px 8px; background: #eef3fb; border: 1px solid #c0d0e8; border-radius: 2px;">
                <strong style="color: var(--win-blue-start);">📁 Proyectos donde se aplicó:</strong>
                <p style="color: #222; margin-top: 2px;">${data.projects}</p>
            </div>
        ` : '';

        bodyEl.innerHTML = `
            <p style="margin-bottom: 8px;"><strong>Descripción:</strong> ${data.description}</p>
            <p style="font-weight: bold; margin-bottom: 4px; color: var(--win-blue-start);">🛠️ Competencias clave:</p>
            <ul style="padding-left: 18px; margin-bottom: 8px; line-height: 1.6;">
                ${skillsListHtml}
            </ul>
            ${projectsHtml}
        `;
    }

    showDialog('skillDetailDialog');
}
window.showSkillDetail = showSkillDetail;

// ============================================================
// Windows 95 Boot Loading Screen (3 Seconds) & Startup Sound
// ============================================================
function initBootScreen() {
    const bootScreen = document.getElementById('win95BootScreen');
    const progressBar = document.getElementById('bootProgressBar');
    const statusText = document.getElementById('bootStatusText');
    const percentText = document.getElementById('bootPercentText');
    const winSound = document.getElementById('win95Sound');

    if (!bootScreen || !progressBar) return;

    // Pre-arm audio on earliest user gesture if any
    let soundArmed = false;
    const armAudio = () => {
        if (!soundArmed && winSound) {
            winSound.load();
            soundArmed = true;
        }
    };
    window.addEventListener('pointerdown', armAudio, { once: true });
    window.addEventListener('keydown', armAudio, { once: true });

    const totalDuration = 3000; // 3 seconds
    const intervalTime = 30; // update every 30ms
    const totalSteps = totalDuration / intervalTime; // 100 steps
    let currentStep = 0;

    const statusStages = [
        { progress: 0, text: 'Iniciando Sergio.v95...' },
        { progress: 20, text: 'Cargando kernel del sistema y perfil...' },
        { progress: 45, text: 'Cargando módulos de desarrollo y habilidades...' },
        { progress: 70, text: 'Inicializando entorno retro y explorador...' },
        { progress: 90, text: 'Iniciando sesión: Sergio Andrés Aparicio...' },
        { progress: 100, text: '¡Bienvenido al sistema!' }
    ];

    const bootTimer = setInterval(() => {
        currentStep++;
        const percent = Math.min(100, Math.round((currentStep / totalSteps) * 100));

        progressBar.style.width = percent + '%';
        if (percentText) percentText.textContent = percent + '%';

        const stage = statusStages.slice().reverse().find(s => percent >= s.progress);
        if (stage && statusText) {
            statusText.textContent = stage.text;
        }

        if (currentStep >= totalSteps) {
            clearInterval(bootTimer);

            // Wait a brief moment at 100% for realistic feel
            setTimeout(() => {
                // Play authentic Windows 95 startup sound
                playWin95StartupSound();

                // Smoothly fade out bootscreen
                bootScreen.classList.add('fade-out');
                setTimeout(() => {
                    bootScreen.style.display = 'none';
                }, 550);
            }, 200);
        }
    }, intervalTime);
}

function playWin95StartupSound() {
    const winSound = document.getElementById('win95Sound');
    if (!winSound) return;

    winSound.volume = 0.85;
    const playPromise = winSound.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            console.log('Autoplay audio policy triggered. Audio will play upon first user interaction.');
            const playOnGesture = () => {
                winSound.play().catch(() => {});
                window.removeEventListener('pointerdown', playOnGesture);
                window.removeEventListener('keydown', playOnGesture);
            };
            window.addEventListener('pointerdown', playOnGesture, { once: true });
            window.addEventListener('keydown', playOnGesture, { once: true });
        });
    }
}
window.playWin95StartupSound = playWin95StartupSound;

// ============================================================
// Dual-OS Architecture & Windows XP Audio / Session Engine
// ============================================================

function setOS(os, playSound = false) {
    currentOS = os;
    try {
        localStorage.setItem('sergio_portfolio_os', os);
    } catch (e) {
        // Safe fallback in restricted iframe/browser environments
    }
    
    const body = document.body;
    const trayBadge = document.getElementById('trayOsBadge');
    const startLabel = document.querySelector('.start-btn-label');
    
    if (os === 'xp') {
        body.classList.remove('theme-win95');
        body.classList.add('theme-xp');
        document.title = 'Sergio Andrés Aparicio - Windows XP Portfolio';
        if (trayBadge) trayBadge.textContent = 'XP';
        if (startLabel) startLabel.textContent = 'Inicio';
        if (playSound) playAudio('xpLogonSound', 0.85);
    } else {
        body.classList.remove('theme-xp');
        body.classList.add('theme-win95');
        document.title = 'Sergio.v95 - Retro Portfolio';
        if (trayBadge) trayBadge.textContent = '95';
        if (startLabel) startLabel.textContent = 'Start';
        if (playSound) playAudio('win95Sound', 0.85);
    }

    // Close open start menus on switch
    const startMenuXp = document.getElementById('startMenuXp');
    const startMenu95 = document.getElementById('startMenu');
    const startBtn = document.getElementById('startBtn');
    if (startMenuXp) startMenuXp.classList.remove('active');
    if (startMenu95) startMenu95.classList.remove('active');
    if (startBtn) startBtn.classList.remove('active');
}
window.setOS = setOS;

function playAudio(audioId, volume = 0.8) {
    if (soundMuted) return;
    const audio = document.getElementById(audioId);
    if (!audio) return;
    try {
        audio.currentTime = 0;
        audio.volume = volume;
        const promise = audio.play();
        if (promise !== undefined) {
            promise.catch(() => {
                // If blocked by browser autoplay policy, play on first user interaction
                const playOnGesture = () => {
                    audio.play().catch(() => {});
                    window.removeEventListener('pointerdown', playOnGesture);
                    window.removeEventListener('keydown', playOnGesture);
                };
                window.addEventListener('pointerdown', playOnGesture, { once: true });
                window.addEventListener('keydown', playOnGesture, { once: true });
            });
        }
    } catch (e) {
        console.warn('Audio playback not supported or interrupted:', e);
    }
}
window.playAudio = playAudio;

function initWelcomeScreen() {
    const loginScreen = document.getElementById('xpLoginScreen');
    const userCardXp = document.getElementById('userCardXp');
    const userCard95 = document.getElementById('userCard95');
    const xpStatusText = document.getElementById('xpStatusText');
    const win95StatusText = document.getElementById('win95StatusText');
    const xpTurnOffBtn = document.getElementById('xpTurnOffBtn');

    if (!loginScreen) return;

    // Login as Windows XP
    if (userCardXp) {
        userCardXp.addEventListener('click', () => {
            userCardXp.classList.add('loading');
            if (xpStatusText) xpStatusText.textContent = 'Iniciando sesión...';
            
            setOS('xp', false);
            playAudio('xpStartupSound', 0.9);

            setTimeout(() => {
                loginScreen.classList.add('fade-out');
                setTimeout(() => {
                    loginScreen.style.display = 'none';
                    userCardXp.classList.remove('loading');
                    if (xpStatusText) xpStatusText.textContent = 'Haga clic para iniciar sesión';
                }, 550);
            }, 650);
        });
    }

    // Login as Windows 95
    if (userCard95) {
        userCard95.addEventListener('click', () => {
            userCard95.classList.add('loading');
            if (win95StatusText) win95StatusText.textContent = 'Iniciando Windows 95...';

            setOS('win95', false);

            setTimeout(() => {
                loginScreen.classList.add('fade-out');
                setTimeout(() => {
                    loginScreen.style.display = 'none';
                    userCard95.classList.remove('loading');
                    if (win95StatusText) win95StatusText.textContent = 'Modo Retro 16-bit Classic';
                    
                    // Show retro Windows 95 loading bar boot screen
                    const bootScreen = document.getElementById('win95BootScreen');
                    if (bootScreen) {
                        bootScreen.style.display = 'flex';
                        bootScreen.classList.remove('fade-out');
                        initBootScreen();
                    }
                }, 400);
            }, 500);
        });
    }

    // Turn Off button on login screen
    if (xpTurnOffBtn) {
        xpTurnOffBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showShutdownDialog();
        });
    }
}
window.initWelcomeScreen = initWelcomeScreen;

function logOff() {
    playAudio('xpLogoffSound', 0.85);

    // Close open menus and active windows
    const startMenuXp = document.getElementById('startMenuXp');
    const startMenu95 = document.getElementById('startMenu');
    const startBtn = document.getElementById('startBtn');
    if (startMenuXp) startMenuXp.classList.remove('active');
    if (startMenu95) startMenu95.classList.remove('active');
    if (startBtn) startBtn.classList.remove('active');

    // Return to the Welcome Screen
    const loginScreen = document.getElementById('xpLoginScreen');
    if (loginScreen) {
        loginScreen.style.display = 'flex';
        // Force reflow
        void loginScreen.offsetWidth;
        loginScreen.classList.remove('fade-out');
    }
}
window.logOff = logOff;

function showShutdownDialog() {
    const dialog = document.getElementById('xpShutdownDialog');
    if (dialog) {
        dialog.style.display = 'flex';
        playAudio('xpBalloonSound', 0.5);
    }
}
window.showShutdownDialog = showShutdownDialog;

function hideShutdownDialog() {
    const dialog = document.getElementById('xpShutdownDialog');
    if (dialog) dialog.style.display = 'none';
}
window.hideShutdownDialog = hideShutdownDialog;
