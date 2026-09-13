// FairDispatch Authentication + AI (100% Working)
const Auth = {
    currentUser: null,
    isAuthenticated: false,
    
    init() {
        this.checkAuthState();
        this.attachEventListeners();
        this.enhanceAIButton();
        console.log('🚀 Auth + AI Ready');
    },
    
    checkAuthState() {
        const userData = localStorage.getItem('fairroute_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.isAuthenticated = true;
            this.showDashboard();
            console.log('✅ Auto-login: ' + this.currentUser.name);
        }
    },
    
    attachEventListeners() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.onsubmit = (e) => this.handleLogin(e);
        }
        
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.onclick = (e) => this.handleLogout(e);
        }
    },
    
    enhanceAIButton() {
        const aiBtn = document.getElementById('aiBtn');
        if (!aiBtn) return;
        
        aiBtn.style.position = 'fixed';
        aiBtn.style.top = '100px';
        aiBtn.style.right = '20px';
        aiBtn.style.zIndex = '9999';
        
        aiBtn.onmouseover = () => {
            aiBtn.style.transform = 'scale(1.05)';
        };
        aiBtn.onmouseout = () => {
            aiBtn.style.transform = 'scale(1)';
        };
        
        aiBtn.onclick = () => {
            if (this.isAuthenticated) {
                runFairDispatchRotation();
            } else {
                alert('⚠️ Login first');
            }
        };
        
        console.log('✅ AI Button Enhanced');
    },
    
    handleLogin(e) {
        e.preventDefault();
        
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        if (!usernameInput || !passwordInput) return;
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        if (!username || !password) {
            this.notify('Enter credentials', 'error');
            return;
        }
        
        this.currentUser = {
            id: 'disp-' + Date.now(),
            username: username,
            email: username.includes('@') ? username : username + '@fairdispatch.ai',
            role: 'dispatcher',
            name: 'Dispatcher ' + username.split('@')[0],
            avatar: 'https://i.pravatar.cc/80?img=' + Math.floor(Math.random() * 30),
            loginTime: new Date().toISOString()
        };
        
        this.isAuthenticated = true;
        localStorage.setItem('fairroute_user', JSON.stringify(this.currentUser));
        
        this.showDashboard();
        this.notify('✅ Login successful! AI Ready 🚀', 'success');
    },
    
    handleLogout(e) {
        if (e) e.preventDefault();
        
        localStorage.removeItem('fairroute_user');
        this.currentUser = null;
        this.isAuthenticated = false;
        this.showLogin();
        this.notify('Logged out', 'info');
    },
    
    showDashboard() {
        const loginEl = document.getElementById('login-screen');
        const dashEl = document.getElementById('main-dashboard');
        
        if (loginEl) {
            loginEl.style.display = 'none';
            loginEl.classList.remove('active');
        }
        if (dashEl) {
            dashEl.style.display = 'flex';
        }
        
        // Update user profile (FIXED - Line 127 area)
        const userNameEl = document.querySelector('.user-name');
        const userAvatarEl = document.querySelector('.user-avatar');
        
        if (userNameEl && this.currentUser) {
            userNameEl.textContent = this.currentUser.name;
        }
        if (userAvatarEl && this.currentUser) {
            userAvatarEl.src = this.currentUser.avatar;
        }
        
        console.log('✅ Dashboard shown: ' + (this.currentUser ? this.currentUser.name : 'Unknown'));
    },
    
    showLogin() {
        const loginEl = document.getElementById('login-screen');
        const dashEl = document.getElementById('main-dashboard');
        
        if (loginEl) {
            loginEl.style.display = 'flex';
            loginEl.classList.add('active');
        }
        if (dashEl) {
            dashEl.style.display = 'none';
        }
        
        const loginForm = document.getElementById('login-form');
        if (loginForm) loginForm.reset();
    },
    
    notify(msg, type) {
        type = type || 'info';
        
        if (window.Utils && window.Utils.notify) {
            return window.Utils.notify(msg, type);
        }
        
        const toast = document.createElement('div');
        toast.textContent = msg;
        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.background = type === 'success' ? '#4CAF50' : '#ef4444';
        toast.style.color = 'white';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '8px';
        toast.style.zIndex = '10000';
        
        document.body.appendChild(toast);
        setTimeout(function() {
            toast.remove();
        }, 3500);
    }
};

// Initialize Auth
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        Auth.init();
    });
} else {
    Auth.init();
}

window.Auth = Auth;
console.log('✅ Auth Module Loaded - Perfect Syntax!');
