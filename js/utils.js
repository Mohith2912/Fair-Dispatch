// Utility Functions
const Utils = {
    // Format currency (Indian Rupees)
    formatCurrency(amount) {
        return `₹${amount.toLocaleString('en-IN')}`;
    },
    
    // Format date
    formatDate(date) {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },
    
    // Format time
    formatTime(date) {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Format date and time together
    formatDateTime(date) {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Get relative time (e.g., "5 minutes ago")
    getRelativeTime(date) {
        if (!date) return 'N/A';
        const now = new Date();
        const past = new Date(date);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    },
    
    // Generate random ID
    generateId(prefix = 'ID') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },
    
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Show notification/toast
    notify(message, type = 'info', duration = 3000) {
        console.log(`[${type.toUpperCase()}] ${message}`);
        // In production, use toast library like Toastify
    },
    
    // Get workload status from effort score
    getWorkloadStatus(effortScore) {
        const thresholds = AppConfig.fairnessThresholds.effortScore;
        if (effortScore < thresholds.low) return 'Available';
        if (effortScore < thresholds.medium) return 'Moderate';
        return 'Overloaded';
    },
    
    // Get workload status class (for CSS)
    getWorkloadClass(effortScore) {
        const thresholds = AppConfig.fairnessThresholds.effortScore;
        if (effortScore < thresholds.low) return 'available';
        if (effortScore < thresholds.medium) return 'moderate';
        return 'overloaded';
    },
    
    // Get fairness index rating
    getFairnessRating(fairnessIndex) {
        const thresholds = AppConfig.fairnessThresholds.fairnessIndex;
        if (fairnessIndex >= thresholds.good) return 'Good';
        if (fairnessIndex >= thresholds.fair) return 'Fair';
        return 'Poor';
    },
    
    // Get fairness index class
    getFairnessClass(fairnessIndex) {
        const thresholds = AppConfig.fairnessThresholds.fairnessIndex;
        if (fairnessIndex >= thresholds.good) return 'good';
        if (fairnessIndex >= thresholds.fair) return 'fair';
        return 'poor';
    },
    
    // Calculate average from array
    calculateAverage(arr) {
        if (!arr || arr.length === 0) return 0;
        return arr.reduce((sum, val) => sum + val, 0) / arr.length;
    },
    
    // Clamp number between min and max
    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    },
    
    // Generate random number between min and max
    randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    // Generate random integer between min and max (inclusive)
    randomIntBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // Shuffle array
    shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },
    
    // Deep clone object
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    // Check if element is in viewport
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    
    // Smooth scroll to element
    scrollToElement(element, offset = 0) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    },
    
    // Format duration (seconds to human readable)
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    },
    
    // Get status color
    getStatusColor(status) {
        const statusLower = status.toLowerCase();
        if (statusLower.includes('available') || statusLower.includes('balanced')) {
            return AppConfig.statusColors.available;
        }
        if (statusLower.includes('moderate')) {
            return AppConfig.statusColors.moderate;
        }
        if (statusLower.includes('overload') || statusLower.includes('overwork')) {
            return AppConfig.statusColors.overloaded;
        }
        return '#718096'; // default gray
    },
    
    // Truncate text
    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },
    
    // Capitalize first letter
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};

window.Utils = Utils;
// Get weighted random element (for dispute status distribution)
Utils.getWeightedRandom = function(array, weights) {
    const random = Math.random();
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
        sum += weights[i];
        if (random < sum) return array[i];
    }
    return array[array.length - 1];
};

// Get relative time string ("2 mins ago", "1 hour ago", etc)
Utils.getRelativeTime = function(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    return new Date(timestamp).toLocaleDateString();
};

// Format date time
Utils.formatDateTime = function(timestamp) {
    const date = new Date(timestamp);
    const options = {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-IN', options);
};

// Format date only
Utils.formatDate = function(timestamp) {
    const date = new Date(timestamp);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
};

// Calculate average
Utils.calculateAverage = function(numbers) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
};

// Get fairness class (for styling)
Utils.getFairnessClass = function(index) {
    if (index >= 75) return 'good';
    if (index >= 50) return 'fair';
    return 'poor';
};

// Get workload class
Utils.getWorkloadClass = function(effortScore) {
    if (effortScore < 60) return 'Available';
    if (effortScore < 80) return 'Moderate';
    return 'Overloaded';
};

// Format duration in minutes/hours
Utils.formatDuration = function(minutes) {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
};

// Debounce function
Utils.debounce = function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
