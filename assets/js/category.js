import { NewsService, authService, adsService, modalService, commentsService, subscriptionService,speechService } from './services/services.js';

const BASE_URL = "https://saurav.tech/NewsAPI/";

class CategoryNews {
    constructor() {
        this.newsService = new NewsService();
        // category extraction from URL
        const pathParts = window.location.pathname.split('/');
        this.category = pathParts[pathParts.indexOf('pages') + 1] || 'general';
        this.container = document.querySelector('.news-container');
        this.isLoading = false;
        this.page = 1;
        this.pageSize = 10;
        this.articles = [];
        
        this.updatePageTitle();
        
        // Map categories to their API endpoints
        this.categoryMap = {
            'latest': 'top-headlines/category/general/us',
            'india': 'top-headlines/category/general/in',
            'world': 'everything/cnn',
            'business': 'top-headlines/category/business/in',
            'sports': 'top-headlines/category/sports/in',
            'entertainment': 'top-headlines/category/entertainment/in',
            'tech': 'top-headlines/category/technology/in'
        };

        this.initializeAuth();
        this.initializeAds();
        this.init();
    }

    updatePageTitle() {
        const title = this.category.charAt(0).toUpperCase() + this.category.slice(1);
        document.title = `${title} News - Times of India`;
        document.querySelector('.section-title').textContent = `${title} News`;

        // active states
        const navLink = document.querySelector(`.nav-link[href*="${this.category}"]`);
        const categoryLink = document.querySelector(`.category-list a[href*="${this.category}"]`);
        
        if (navLink) navLink.classList.add('active');
        if (categoryLink) categoryLink.classList.add('active');
    }

    async init() {
        await this.fetchNews();
        this.setupInfiniteScroll();
        this.initBreakingNews();
    }

    async fetchNews(loadMore = false) {
        if (this.isLoading) return;
        this.isLoading = true;

        try {
            const data = await this.newsService.fetchNews(this.category);
            
            // Store all articles
            if (!loadMore) {
                this.articles = data.articles || [];
            }

            // Calculate pagination
            const startIndex = (this.page - 1) * this.pageSize;
            const endIndex = startIndex + this.pageSize;
            const paginatedArticles = this.articles.slice(startIndex, endIndex);

            this.displayNews(paginatedArticles, loadMore);
            
            // Update loading state based on remaining articles
            const hasMore = endIndex < this.articles.length;
            if (!hasMore) {
                this.removePaginationListener();
            }

        } catch (error) {
            console.error('Critical error:', error);
            if (!loadMore) {
                this.container.innerHTML = `
                    <div class="error-message">
                        <p>${error.message}</p>
                        <button onclick="window.location.reload()" class="retry-btn">
                            Try Again
                        </button>
                    </div>`;
            }
        } finally {
            this.isLoading = false;
        }
    }

    async initializeAds() {
        if (!subscriptionService.hasActiveSubscription()) {
            // Add sidebar ad
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                const sidebarAd = adsService.renderAd('sidebar');
                const adContainer = document.createElement('div');
                adContainer.className = 'sidebar-card';
                adContainer.innerHTML = sidebarAd;
                sidebar.appendChild(adContainer);
            }
        }
    }

    displayNews(articles, append = false) {
        if (!this.container) return;
        
        if (!append) {
            this.container.innerHTML = '';
        }

        if (!articles || articles.length === 0) {
            if (!append) {
                this.container.innerHTML = `
                    <div class="error-message">
                        <p>No articles found in ${this.category} category</p>
                        <button onclick="window.location.href='../../'">Go to Homepage</button>
                    </div>`;
            }
            return;
        }

        const newsHTML = articles.map((article, index) => `
            <article class="news-card">
                ${article.urlToImage ? 
                    `<img src="${article.urlToImage}" alt="${article.title}" loading="lazy">` : 
                    '<div class="no-image"></div>'}
                <div class="news-content">
                    <span class="news-category">${article.source?.name || 'Times of India'}</span>
                    <h2 class="news-title">${article.title}</h2>
                    <p class="news-excerpt">${article.description || ''}</p>
                    <div class="news-meta">
                        <time datetime="${article.publishedAt}">
                            ${new Date(article.publishedAt).toLocaleDateString()}
                        </time>
                        <a href="${article.url}" class="read-more-btn">Read Original</a>
                        <button onclick="handleListen(this, '${article.title}. ${article.description || ''}')" class="listen-btn">
                            <i class="fas fa-volume-up"></i>
                        </button>
                    </div>
                    ${this.renderComments(article.url)}
                </div>
            </article>
            ${!subscriptionService.hasActiveSubscription() && index === 0 ? adsService.renderAd('inline') : ''}
        `).join('');

        if (append) {
            this.container.insertAdjacentHTML('beforeend', newsHTML);
        } else {
            this.container.innerHTML = newsHTML;
        }
    }

    renderComments(articleId) {
        const comments = commentsService.getComments(articleId);
        
        return `
            <div class="comments-section">
                <h3>Comments (${comments.length})</h3>
                ${authService.isLoggedIn() ? `
                    <form class="comment-form" onsubmit="handleComment(event, '${articleId}')">
                        <textarea placeholder="Add a comment..." required></textarea>
                        <button type="submit">Post</button>
                    </form>
                ` : `
                    <p>Please <a href="#" onclick="showLoginModal()">login</a> to comment</p>
                `}
                <div class="comment-list">
                    ${comments.map(comment => `
                        <div class="comment">
                            <strong>${comment.user}</strong>
                            <p>${comment.text}</p>
                            <div class="comment-meta">
                                <time>${new Date(comment.createdAt).toLocaleDateString()}</time>
                                <button onclick="handleLike('${comment.id}')">
                                    <i class="far fa-heart"></i> ${comment.likes}
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    setupInfiniteScroll() {
        this.scrollHandler = () => {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
                if (!this.isLoading) {
                    this.page++;
                    this.fetchNews(true);
                }
            }
        };
        window.addEventListener('scroll', this.scrollHandler);
    }

    removePaginationListener() {
        if (this.scrollHandler) {
            window.removeEventListener('scroll', this.scrollHandler);
        }
    }

    async initBreakingNews() {
        try {
            const breakingNews = await this.newsService.fetchNews('general');
            if (breakingNews.articles?.length) {
                const ticker = document.getElementById('breakingNewsTicker');
                if (ticker) {
                    const latestNews = breakingNews.articles[0];
                    ticker.innerHTML = `
                        <a href="${latestNews.url}" target="_blank" rel="noopener noreferrer" 
                           style="color: white; text-decoration: none;">
                            ${latestNews.title}
                        </a>`;
                }
            }
        } catch (error) {
            console.error('Failed to load breaking news:', error);
        }
    }

    initializeAuth() {
        authService.init();
        this.updateAuthUI();
    }

    updateAuthUI() {
        const user = authService.getCurrentUser();
        const headerButtons = document.querySelector('.header-buttons');
        
        if (user) {
            document.body.classList.add('logged-in');
            headerButtons.innerHTML = `
                <div class="user-menu">
                    <span>Welcome, ${user.name}</span>
                    <button onclick="handleLogout()">Logout</button>
                </div>
            `;
        } else {
            document.body.classList.remove('logged-in');
            headerButtons.innerHTML = `
                <button type="button" class="auth-btn" onclick="window.showLoginModal()">Login</button>
            `;
        }
    }

}

// Global handlers for modal actions
window.showLoginModal = () => modalService.showLoginModal();
window.showSignupModal = () => modalService.showSignupModal();
window.handleLogout = function() {
    authService.logout();
    window.location.reload();
};

// Add global handler for speech
window.handleListen = function(button, text) {
    const wasActive = button.classList.contains('speaking');
    
    // Reset all buttons
    document.querySelectorAll('.listen-btn').forEach(btn => {
        btn.classList.remove('speaking');
        btn.innerHTML = '<i class="fas fa-volume-up"></i>';
    });

    if (!wasActive) {
        button.classList.add('speaking');
        button.innerHTML = '<i class="fas fa-stop"></i>';
    }
    
    speechService.speak(text);
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CategoryNews();
});
