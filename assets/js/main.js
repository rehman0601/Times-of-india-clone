import { NewsService, authService, adsService, modalService, commentsService, speechService,subscriptionService } from './services/services.js';

const newsService = new NewsService();

// Base URL for the news API
const BASE_URL = "https://saurav.tech/NewsAPI/";

// Add state management
let state = {
    pageSize: 5,
    articles: {
        topStories: [],
        latestNews: [],
        indiaNews: [],
        trending: []
    },
    currentPage: 1,
    hasMore: true,
    isLoading: false
};

// Main function to fetch news data
async function fetchNews(loadMore = false) {
    if (state.isLoading || (!loadMore && !state.hasMore)) return;
    state.isLoading = true;
  
    try {
        newsService.resetErrorCount();
        
        if (!loadMore) {
            // Initial load
            const [topStories, latestNews, indiaNews, trendingNews] = await Promise.all([
                newsService.fetchNews('general'),
                newsService.fetchNews('latest'),
                newsService.fetchNews('india'),
                newsService.fetchNews('technology')
            ].map(p => p.catch(error => ({ articles: [] }))));

            // Store all articles
            state.articles = {
                topStories: topStories.articles || [],
                latestNews: latestNews.articles || [],
                indiaNews: indiaNews.articles || [],
                trending: trendingNews.articles || []
            };

            // Display initial content
            displayTopStories(state.articles.topStories.slice(0, 3));
            displayLatestNews(state.articles.latestNews.slice(0, state.pageSize));
            displayIndiaNews(state.articles.indiaNews.slice(0, state.pageSize));
            displayTrendingNews(state.articles.trending.slice(0, 5));
            displayPopularNews(state.articles.trending.slice(0, 5));

            if (topStories.articles?.length) {
                document.getElementById('breakingNewsTicker').textContent = topStories.articles[0].title;
            }
        } else {
            // Load more for India News and Latest News
            const startIndex = state.currentPage * state.pageSize;
            const latestNewsSlice = state.articles.latestNews.slice(startIndex, startIndex + state.pageSize);
            const indiaNewsSlice = state.articles.indiaNews.slice(startIndex, startIndex + state.pageSize);

            if (latestNewsSlice.length || indiaNewsSlice.length) {
                displayLatestNews(latestNewsSlice, true);
                displayIndiaNews(indiaNewsSlice, true);
                state.currentPage++;
            } else {
                state.hasMore = false;
            }
        }

    } catch (error) {
        console.error('Failed to fetch news:', error);
        // Show error only if all requests failed
        if (newsService.errorCount >= newsService.maxErrors) {
            document.querySelector('.main-content').innerHTML = `
                <div class="error-message">
                    <p>Unable to load news at this time. Please try again later.</p>
                    <button onclick="window.location.reload()" class="retry-btn">Refresh Page</button>
                </div>`;
        }
    } finally {
        state.isLoading = false;
    }
}

function createAdElement(index) {
    return `
        <div class="ad-container article-ad">
            <span class="ad-label">Advertisement</span>
            <img src="https://picsum.photos/800/200?random=${index}" alt="Advertisement" />
        </div>
    `;
}

function displayTopStories(articles) {
    const container = document.getElementById('topStories');
    if (!container) return;
    
    const content = articles.map((article, index) => `
        <article class="news-card">
            ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}">` : ''}
            <div class="news-content">
                <p class="news-category">${article.source?.name || 'Times of India'}</p>
                <h3 class="news-title">${article.title}</h3>
                <p class="news-excerpt">${article.description || ''}</p>
                <div class="news-meta">
                    <time datetime="${article.publishedAt}">
                        ${new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </time>
                    <a href="${article.url}" class="read-original" target="_blank" rel="noopener noreferrer">Read Original</a>
                    <button onclick="handleListen(this, '${article.title}. ${article.description || ''}')" class="listen-btn">
                        <i class="fas fa-volume-up"></i>
                    </button>
                </div>
                ${renderComments(article.url)}
            </div>
        </article>
    `).join('');
    
    container.innerHTML = content;
}

function createSponsoredContent(index) {
    return `
        <article class="news-card sponsored-content">
            <div class="sponsor-label">Sponsored</div>
            <img src="https://picsum.photos/800/400?random=${index}" alt="Sponsored Content">
            <div class="news-content">
                <p class="news-category">Sponsored</p>
                <h3 class="news-title">Sponsored Content</h3>
                <p class="news-excerpt">This is a sponsored article from our partners.</p>
                <div class="news-meta">
                    <a href="#" class="sponsored-link">Learn More</a>
                </div>
            </div>
        </article>
    `;
}

function displayLatestNews(articles, append = false) {
    const container = document.getElementById('latestNews');
    if (!append) container.innerHTML = '';
    
    articles.forEach((article, index) => {
        const articleHTML = `
            <article class="news-card">
                ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}" onerror="this.style.display='none'">` : ''}
                <div class="news-content">
                    <p class="news-category">${article.source?.name || 'Times of India'}</p>
                    <h3 class="news-title">${article.title}</h3>
                    <p class="news-excerpt">${article.description || ''}</p>
                    <div class="news-meta">
                        <time datetime="${article.publishedAt}">
                            ${new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </time>
                        <a href="${article.url}" class="read-original">Read Original</a>
                        <button onclick="handleListen(this, '${article.title}. ${article.description || ''}')" class="listen-btn">
                            <i class="fas fa-volume-up"></i>
                        </button>
                    </div>
                    ${renderComments(article.url)}
                </div>
            </article>
            ${!subscriptionService.hasActiveSubscription() && (index + 1) % 3 === 0 ? createAdElement(index) : ''}
        `;
        container.innerHTML += articleHTML;
    });
}

function displayIndiaNews(articles, append = false) {
    const container = document.getElementById('indiaNews');
    if (!append) container.innerHTML = '';
    
    articles.forEach((article, index) => {
        const articleHTML = `
            <article class="news-card">
                ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}">` : ''}
                <div class="news-content">
                    <p class="news-category">${article.source?.name || 'Times of India'}</p>
                    <h3 class="news-title">${article.title}</h3>
                    <p class="news-excerpt">${article.description || ''}</p>
                    <div class="news-meta">
                        <time datetime="${article.publishedAt}">
                            ${new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </time>
                        <a href="${article.url}" class="read-original">Read Original</a>
                        <button onclick="handleListen(this, '${article.title}. ${article.description || ''}')" class="listen-btn">
                            <i class="fas fa-volume-up"></i>
                        </button>
                    </div>
                    ${renderComments(article.url)}
                </div>
            </article>
            ${!subscriptionService.hasActiveSubscription() && (index + 1) % 3 === 0 ? createAdElement(index) : ''}
        `;
        container.innerHTML += articleHTML;
    });
}

function displayTrendingNews(articles) {
    const container = document.getElementById('trendingNews');
    if (!container) return;
    container.innerHTML = articles.slice(0, 5).map((article, index) => `
        <li>
            <a href="${article.url}" target="_blank" rel="noopener noreferrer">
                <span class="number">${index + 1}</span>
                <span class="title">${article.title}</span>
            </a>
        </li>
    `).join('');
}

function displayPopularNews(articles) {
    const container = document.getElementById('popularNews');
    if (!container) return;
    container.innerHTML = articles.slice(0, 5).map((article, index) => `
        <li>
            <a href="${article.url}" target="_blank" rel="noopener noreferrer">
                <span class="number">${index + 1}</span>
                <span class="title">${article.title}</span>
            </a>
        </li>
    `).join('');
}

// Simple scroll handler for infinite loading
function setupInfiniteScroll() {
    const scrollHandler = () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
            if (!state.isLoading && state.hasMore) {
                fetchNews(true);
            }
        }
    };
    window.addEventListener('scroll', scrollHandler);
    return () => window.removeEventListener('scroll', scrollHandler);
}

function updateAuthUI() {
    const user = authService.getCurrentUser();
    if (user) {
        document.body.classList.add('logged-in');
        const headerButtons = document.querySelector('.header-buttons');
        headerButtons.innerHTML = `
            <div class="user-menu">
                <span>Welcome, ${user.name}</span>
                <button onclick="handleLogout()">Logout</button>
            </div>
        `;
    } else {
        document.body.classList.remove('logged-in');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    fetchNews();
    setupInfiniteScroll();
    updateAuthUI();

    // Remove banner ad for non-subscribers
    document.querySelector('.sidebar').insertAdjacentHTML('beforeend', 
        adsService.renderAd('sidebar')
    );
});

window.handleLogout = function() {
    authService.logout();
    window.location.reload();
};

window.showSubscriptionModal = function() {
    if (!window.auth.isLoggedIn()) {
        showLoginModal();
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'subscription-modal';
    modal.innerHTML = `
        <div class="modal-content subscription-content">
            <span class="close-btn">&times;</span>
            <h2>Subscribe to Premium</h2>
            <div class="plan-options">
                <div class="plan">
                    <div class="plan-badge">Popular</div>
                    <h3>Basic</h3>
                    <div class="plan-price">
                        <span class="currency">₹</span>
                        <span class="amount">199</span>
                        <span class="period">/month</span>
                    </div>
                    <ul>
                        <li>Ad-free experience</li>
                        <li>Basic articles access</li>
                        <li>Mobile app access</li>
                    </ul>
                    <button onclick="subscribeToPlan('basic')" class="plan-button">Choose Basic</button>
                </div>
                <div class="plan premium">
                    <div class="plan-badge">Best Value</div>
                    <h3>Premium</h3>
                    <div class="plan-price">
                        <span class="currency">₹</span>
                        <span class="amount">499</span>
                        <span class="period">/month</span>
                    </div>
                    <ul>
                        <li>All Basic features</li>
                        <li>Premium articles access</li>
                        <li>Exclusive content</li>
                        <li>Early access to stories</li>
                    </ul>
                    <button onclick="subscribeToPlan('premium')" class="plan-button">Choose Premium</button>
                </div>
            </div>
            <div class="subscription-footer">
                <p>Cancel anytime. Instant access after subscription.</p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.close-btn').onclick = () => modal.remove();
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
};

window.subscribeToPlan = function(plan) {
    if (window.auth.subscribe(plan)) {
        alert('Subscription successful!');
        window.location.reload();
    }
};

window.showLoginModal = function() {
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
                <p style="margin-top: 15px; text-align: center;">
                    New user? <a href="#" onclick="showSignupModal(); return false;">Create Account</a>
                </p>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // Close button handler
    modal.querySelector('.close-btn').onclick = () => modal.remove();

    // Click outside to close
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };

    // Form submission
    modal.querySelector('#loginForm').onsubmit = (e) => {
        e.preventDefault();
        const email = modal.querySelector('#email').value;
        const password = modal.querySelector('#password').value;

        if (window.auth.login(email, password)) {
            modal.remove();
            window.location.reload();
        } else {
            alert('Invalid credentials');
        }
    };
};

window.showSignupModal = function() {
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
                <p style="margin-top: 15px; text-align: center;">
                    Already have an account? <a href="#" onclick="showLoginModal(); return false;">Login</a>
                </p>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // Close button handler
    modal.querySelector('.close-btn').onclick = () => modal.remove();

    // Click outside to close  
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };

    // Form submission
    modal.querySelector('#signupForm').onsubmit = (e) => {
        e.preventDefault();
        const name = modal.querySelector('#name').value;
        const email = modal.querySelector('#email').value;
        const password = modal.querySelector('#password').value;

        if (window.auth.signup(email, password, name)) {
            alert('Account created successfully!');
            modal.remove();
            showLoginModal();
        } else {
            alert('Email already exists!');
        }
    };
};

function renderComments(articleId) {
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
                <p>Please <a href="#" onclick="showLoginModal(); return false;">login</a> to comment</p>
            `}
            <div class="comment-list">
                ${comments.map(comment => `
                    <div class="comment">
                        <strong>${comment.user}</strong>
                        <p>${comment.text}</p>
                        <div class="comment-meta">
                            <time>${new Date(comment.createdAt).toLocaleDateString()}</time>
                            <button onclick="handleLike('${articleId}', '${comment.id}')">
                                <i class="far fa-heart"></i> ${comment.likes}
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Add global handlers
window.handleComment = (event, articleId) => {
    event.preventDefault();
    if (!authService.isLoggedIn()) {
        modalService.showLoginModal();
        return;
    }
    const text = event.target.querySelector('textarea').value;
    const user = authService.getCurrentUser();
    commentsService.addComment(articleId, text, user);
    window.location.reload();
};

window.handleLike = (articleId, commentId) => {
    if (!authService.isLoggedIn()) {
        modalService.showLoginModal();
        return;
    }
    commentsService.likeComment(articleId, commentId);
    window.location.reload();
};

// Add global handler for speech
window.handleListen = function(button, text) {
    const wasActive = button.classList.contains('speaking');
    
    // Reset all buttons
    document.querySelectorAll('.listen-btn').forEach(btn => {
        btn.classList.remove('speaking');
        btn.innerHTML = '<i class="fas fa-volume-up"></i> Listen';
    });

    if (!wasActive) {
        button.classList.add('speaking');
        button.innerHTML = '<i class="fas fa-stop"></i> Stop';
    }
    
    speechService.speak(text);
};

// Start the app
fetchNews();