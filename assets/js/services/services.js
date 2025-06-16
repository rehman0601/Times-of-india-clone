// Auth Service
const STORAGE_KEY = 'toi_users';
const CURRENT_USER_KEY = 'toi_current_user';
const SUBSCRIPTIONS_KEY = 'toi_subscriptions';

export const authService = {
    init() {
        if (!localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([{
                id: 1699000000000,
                email: "test@test.com",
                password: "test123",
                name: "Test User"
            }]));
        }
        const savedUser = localStorage.getItem(CURRENT_USER_KEY);
        if (savedUser) {
            document.body.classList.add('logged-in');
        }
    },

    login(email, password) {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
            return true;
        }
        return false;
    },

    signup(email, password, name) {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (users.some(u => u.email === email)) return false;
        const newUser = { id: Date.now(), email, password, name };
        users.push(newUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        return true;
    },

    logout() {
        localStorage.removeItem(CURRENT_USER_KEY);
    },

    getCurrentUser() {
        return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    },

    isLoggedIn() {
        return !!this.getCurrentUser();
    }
};

// News Service
export class NewsService {
    constructor() {
        this.errorCount = 0;
        this.maxErrors = 10;
        this.BASE_URL = "https://saurav.tech/NewsAPI/";
        this.categoryMap = {
            'general': 'top-headlines/category/general/in.json',
            'latest': 'top-headlines/category/general/in.json',
            'india': 'top-headlines/category/general/in.json',
            'world': 'top-headlines/category/general/us.json',
            'business': 'top-headlines/category/business/in.json',
            'sports': 'top-headlines/category/sports/in.json',
            'tech': 'top-headlines/category/technology/in.json'
        };
    }

    async fetchNews(category) {
        try {
            if (this.errorCount >= this.maxErrors) {
                throw new Error('Too many failed requests');
            }
            const endpoint = this.categoryMap[category] || this.categoryMap['general'];
            const response = await fetch(`${this.BASE_URL}${endpoint}`);
            if (!response.ok) {
                this.errorCount++;
                throw new Error(`Failed to fetch ${category} news`);
            }
            return await response.json();
        } catch (error) {
            this.errorCount++;
            console.error(`Failed to fetch ${category} news:`, error);
            return { articles: [] };
        }
    }

    resetErrorCount() {
        this.errorCount = 0;
    }
}

// Comments Service
const COMMENTS_KEY = 'toi_comments';

export const commentsService = {
    getComments(articleId) {
        const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}');
        return comments[articleId] || [];
    },

    addComment(articleId, text, user) {
        const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}');
        if (!comments[articleId]) comments[articleId] = [];
        
        const newComment = {
            id: Date.now(),
            text,
            user: user.name,
            likes: 0,
            createdAt: new Date().toISOString()
        };
        
        comments[articleId].unshift(newComment);
        localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
        return newComment;
    },

    likeComment(articleId, commentId) {
        const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}');
        const comment = comments[articleId]?.find(c => c.id === commentId);
        if (comment) {
            comment.likes++;
            localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
            return true;
        }
        return false;
    }
};

// Modal Service
export const modalService = {
    showLoginModal() {
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <form id="loginForm" class="auth-form">
                    <h2>Login</h2>
                    <div class="form-group">
                        <input type="email" id="email" required placeholder="Email">
                    </div>
                    <div class="form-group">
                        <input type="password" id="password" required placeholder="Password">
                    </div>
                    <button type="submit">Login</button>
                    <p class="form-footer">
                        New user? <a href="#" class="switch-form">Create Account</a>
                    </p>
                </form>
            </div>
        `;
        
        this.setupModalHandlers(modal, 'login');
        document.body.appendChild(modal);
    },

    showSignupModal() {
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <form id="signupForm" class="auth-form">
                    <h2>Create Account</h2>
                    <div class="form-group">
                        <input type="text" id="name" required placeholder="Full Name">
                    </div>
                    <div class="form-group">
                        <input type="email" id="email" required placeholder="Email">
                    </div>
                    <div class="form-group">
                        <input type="password" id="password" required placeholder="Password">
                    </div>
                    <button type="submit">Sign Up</button>
                    <p class="form-footer">
                        Already have an account? <a href="#" class="switch-form">Login</a>
                    </p>
                </form>
            </div>
        `;
        
        this.setupModalHandlers(modal, 'signup');
        document.body.appendChild(modal);
    },

    setupModalHandlers(modal, type) {
        modal.querySelector('.close-btn').onclick = () => modal.remove();
        modal.onclick = e => { if (e.target === modal) modal.remove(); };

        const form = modal.querySelector('form');
        if (form) {
            form.onsubmit = (e) => this.handleFormSubmit(e, type, modal);
        }

        const switchForm = modal.querySelector('.switch-form');
        if (switchForm) {
            switchForm.onclick = (e) => {
                e.preventDefault();
                modal.remove();
                type === 'login' ? this.showSignupModal() : this.showLoginModal();
            };
        }
    },

    handleFormSubmit(e, type, modal) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        let success = false;
        if (type === 'login') {
            success = authService.login(data.email, data.password);
        } else if (type === 'signup') {
            success = authService.signup(data.email, data.password, data.name);
        }

        if (success) {
            modal.remove();
            window.location.reload();
        } else {
            alert(type === 'login' ? 'Invalid credentials' : 'Email already exists');
        }
    }
};

// Ads Service
export const adsService = {
    renderAd(type) {
        const ads = {
            sidebar: `<div class="sidebar-ad">
                <span class="ad-label">Advertisement</span>
                <img src="https://picsum.photos/300/600" alt="Sidebar Ad">
            </div>`,
            banner: `<div class="banner-ad">
                <span class="ad-label">Advertisement</span>
                <img src="https://picsum.photos/800/100" alt="Banner Ad">
            </div>`,
            inline: `<div class="article-ad">
                <span class="ad-label">Advertisement</span>
                <img src="https://picsum.photos/800/200" alt="Inline Ad">
            </div>`
        };
        return ads[type] || '';
    }
};
// Subscription Service
export const subscriptionService = {
    plans: {
        basic: {
            price: 199,
            features: ['Ad-free experience', 'Basic articles access', 'Mobile app access']
        },
        premium: {
            price: 499,
            features: ['All Basic features', 'Premium articles access', 'Exclusive content', 'Early access']
        }
    },

    subscribe(userId, plan) {
        const subscriptions = JSON.parse(localStorage.getItem(SUBSCRIPTIONS_KEY) || '{}');
        subscriptions[userId] = {
            plan,
            startDate: new Date().toISOString(),
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
        return true;
    },

    getSubscription(userId) {
        const subscriptions = JSON.parse(localStorage.getItem(SUBSCRIPTIONS_KEY) || '{}');
        return subscriptions[userId];
    },

    hasActiveSubscription(userId) {
        const subscription = this.getSubscription(userId);
        if (!subscription) return false;
        return new Date(subscription.expiryDate) > new Date();
    }
};

// Speech Service
export const speechService = {
    speaking: false,
    speech: null,

    speak(text) {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            this.speaking = false;
            return;
        }

        this.speech = new SpeechSynthesisUtterance(text);
        this.speech.rate = 0.9;
        this.speech.pitch = 1;
        
        this.speech.onend = () => {
            this.speaking = false;
            // Reset all buttons
            document.querySelectorAll('.listen-btn').forEach(btn => {
                btn.classList.remove('speaking');
                btn.innerHTML = '<i class="fas fa-volume-up"></i>';
            });
        };

        window.speechSynthesis.speak(this.speech);
        this.speaking = true;
    }
};
