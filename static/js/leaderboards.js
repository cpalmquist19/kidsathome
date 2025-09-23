/**
 * Leaderboards Page JavaScript
 * Handles leaderboard interactions, animations, and data management
 */

// Initialize leaderboards when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadLeaderboardData();
    setupAnimations();
    setupInteractions();
});

/**
 * Load leaderboard data from API
 */
async function loadLeaderboardData() {
    const loadingElement = document.getElementById('leaderboard-loading');
    const emptyElement = document.getElementById('leaderboard-empty');
    const contentElement = document.getElementById('leaderboard-content');
    
    try {
        // Show loading state
        if (loadingElement) {
            loadingElement.classList.remove('hidden');
        }
        if (emptyElement) {
            emptyElement.classList.add('hidden');
        }
        
        // Fetch data from API
        const response = await fetch('/api/leaderboard?limit=10');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Hide loading state
        if (loadingElement) {
            loadingElement.classList.add('hidden');
        }
        
        if (data.leaderboard && data.leaderboard.length > 0) {
            renderLeaderboard(data.leaderboard);
        } else {
            // Show empty state
            if (emptyElement) {
                emptyElement.classList.remove('hidden');
            }
        }
        
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        
        // Hide loading state
        if (loadingElement) {
            loadingElement.classList.add('hidden');
        }
        
        // Show error state
        showErrorState('Failed to load leaderboard. Please try again later.');
    }
}

/**
 * Render leaderboard entries
 */
function renderLeaderboard(leaderboardData) {
    const contentElement = document.getElementById('leaderboard-content');
    if (!contentElement) return;
    
    // Clear existing content except loading/empty states
    const existingEntries = contentElement.querySelectorAll('.leaderboard-entry');
    existingEntries.forEach(entry => entry.remove());
    
    leaderboardData.forEach((entry, index) => {
        const entryElement = createLeaderboardEntry(entry, index);
        contentElement.appendChild(entryElement);
        
        // Animate entry with delay
        setTimeout(() => {
            entryElement.style.opacity = '1';
            entryElement.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

/**
 * Create a leaderboard entry element
 */
function createLeaderboardEntry(entry, index) {
    const entryElement = document.createElement('div');
    
    // Determine styling based on rank
    let entryClass = 'p-4 bg-gray-800/50 rounded-xl border border-gray-700/50';
    let rankClass = 'flex items-center justify-center w-10 h-10 bg-gray-700 rounded-full text-white font-bold text-lg';
    let rankIcon = '';
    
    if (entry.rank === 1) {
        entryClass = 'p-4 bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 rounded-xl border border-yellow-500/30';
        rankClass = 'flex items-center justify-center w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full text-white font-bold text-lg';
        rankIcon = '🥇';
    } else if (entry.rank === 2) {
        entryClass = 'p-4 bg-gradient-to-r from-gray-600/20 to-gray-500/20 rounded-xl border border-gray-500/30';
        rankClass = 'flex items-center justify-center w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full text-white font-bold text-lg';
        rankIcon = '🥈';
    } else if (entry.rank === 3) {
        entryClass = 'p-4 bg-gradient-to-r from-orange-600/20 to-orange-500/20 rounded-xl border border-orange-500/30';
        rankClass = 'flex items-center justify-center w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full text-white font-bold text-lg';
        rankIcon = '🥉';
    }
    
    entryElement.className = `leaderboard-entry ${entryClass}`;
    entryElement.style.opacity = '0';
    entryElement.style.transform = 'translateY(20px)';
    entryElement.style.transition = 'all 0.5s ease-out';
    
    // Format discovery chance
    const discoveryChance = entry.rarest_discovery?.discovery_chance;
    const chanceText = discoveryChance ? `1 in ${Math.round(discoveryChance).toLocaleString()}` : 'N/A';
    
    entryElement.innerHTML = `
        <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-4">
                <div class="${rankClass}">
                    ${entry.rank}
                </div>
                <div>
                    <div class="text-white font-semibold text-lg">${entry.username}</div>
                    <div class="text-gray-300 text-sm">${entry.total_systems} Systems Discovered</div>
                </div>
            </div>
            ${rankIcon ? `<div class="text-3xl">${rankIcon}</div>` : ''}
        </div>
        <div class="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
            <div class="flex items-center justify-between">
                <div>
                    <div class="text-gray-300 font-semibold text-sm">Rarest Discovery</div>
                    <div class="text-white font-bold">${entry.rarest_discovery?.name || 'None'}</div>
                </div>
                <div class="text-right">
                    <div class="text-blue-300 text-xs font-semibold">${entry.rarest_discovery?.rarity_class || 'N/A'}</div>
                    <div class="text-gray-400 text-xs">${chanceText}</div>
                </div>
            </div>
        </div>
    `;
    
    return entryElement;
}

/**
 * Show error state
 */
function showErrorState(message) {
    const contentElement = document.getElementById('leaderboard-content');
    if (!contentElement) return;
    
    const errorElement = document.createElement('div');
    errorElement.className = 'text-center py-8';
    errorElement.innerHTML = `
        <div class="text-4xl mb-4">⚠️</div>
        <h3 class="text-xl font-bold text-red-400 mb-2">Error Loading Leaderboard</h3>
        <p class="text-gray-300">${message}</p>
        <button onclick="loadLeaderboardData()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Try Again
        </button>
    `;
    
    contentElement.appendChild(errorElement);
}

/**
 * Setup page animations
 */
function setupAnimations() {
    // Add floating animation to leaderboard icons
    const leaderboardIcons = document.querySelectorAll('.leaderboard-icon');
    leaderboardIcons.forEach((icon, index) => {
        icon.style.animationDelay = `${index * 0.5}s`;
        icon.style.animation = 'float 6s ease-in-out infinite';
    });
    
    // Add hover effects to leaderboard cards
    const leaderboardCards = document.querySelectorAll('.leaderboard-card');
    leaderboardCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05) translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) translateY(0)';
        });
    });
}

/**
 * Setup interactive features
 */
function setupInteractions() {
    // Add click handlers for leaderboard entries
    document.addEventListener('click', function(e) {
        const leaderboardEntry = e.target.closest('.leaderboard-entry');
        if (leaderboardEntry) {
            handleLeaderboardEntryClick(leaderboardEntry);
        }
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            handleKeyboardNavigation(e);
        }
    });
}

/**
 * Handle leaderboard entry clicks
 */
function handleLeaderboardEntryClick(entry) {
    const playerName = entry.querySelector('.text-white.font-semibold').textContent;
    const playerScore = entry.querySelector('.text-gray-300.text-sm').textContent;
    
    // Add visual feedback
    entry.style.transform = 'scale(0.98)';
    setTimeout(() => {
        entry.style.transform = '';
    }, 150);
    
    // Show player details (placeholder for future functionality)
    console.log(`Clicked on ${playerName} with ${playerScore}`);
    
    // Could show a modal with player details here
    showPlayerDetails(playerName, playerScore);
}

/**
 * Show player details (placeholder)
 */
function showPlayerDetails(name, score) {
    // This would typically show a modal or navigate to player profile
    console.log(`Player Details: ${name} - ${score}`);
    
    // For now, just show a simple alert (replace with proper modal later)
    if (typeof showNotification === 'function') {
        showNotification(`Viewing details for ${name}`, 'info');
    }
}

/**
 * Handle keyboard navigation
 */
function handleKeyboardNavigation(e) {
    const focusedElement = document.activeElement;
    const leaderboardEntries = document.querySelectorAll('.leaderboard-entry');
    
    if (leaderboardEntries.length > 0) {
        const currentIndex = Array.from(leaderboardEntries).indexOf(focusedElement);
        
        if (e.shiftKey && e.key === 'Tab') {
            // Navigate backwards
            e.preventDefault();
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : leaderboardEntries.length - 1;
            leaderboardEntries[prevIndex].focus();
        } else if (e.key === 'Tab' && !e.shiftKey) {
            // Navigate forwards
            e.preventDefault();
            const nextIndex = currentIndex < leaderboardEntries.length - 1 ? currentIndex + 1 : 0;
            leaderboardEntries[nextIndex].focus();
        }
    }
}

/**
 * Refresh leaderboard data
 */
function refreshLeaderboards() {
    console.log('Refreshing leaderboards...');
    loadLeaderboardData();
}

/**
 * Utility function to show notifications
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 transition-all duration-300 transform translate-x-full`;
    
    // Set notification style based on type
    switch (type) {
        case 'success':
            notification.className += ' bg-green-600';
            break;
        case 'error':
            notification.className += ' bg-red-600';
            break;
        case 'warning':
            notification.className += ' bg-yellow-600';
            break;
        default:
            notification.className += ' bg-blue-600';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Export functions for external use
window.LeaderboardManager = {
    refreshLeaderboards,
    loadLeaderboardData,
    showNotification
};