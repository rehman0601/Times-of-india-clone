// Base URL for the news API
const BASE_URL = "https://saurav.tech/NewsAPI/";

// state tracking
let pageNumber = 1;
let isLoading = false;

// Main function to fetch news data
async function fetchNews(loadMore = false) {
  if (isLoading) return;
  isLoading = true;
  
  try {
    // Fetch different categories of news
    const topStories = await fetch(`${BASE_URL}top-headlines/category/general/in.json`);
    const latestNews = await fetch(`${BASE_URL}top-headlines/category/business/in.json`);
    const indiaNews = await fetch(`${BASE_URL}top-headlines/category/sports/in.json`);
    const trendingNews = await fetch(`${BASE_URL}top-headlines/category/technology/in.json`);

    // Convert responses to JSON
    const [topStoriesData, latestNewsData, indiaNewsData, trendingNewsData] = await Promise.all([
      topStories.json(),
      latestNews.json(),
      indiaNews.json(),
      trendingNews.json()
    ]);

    // Calculate starting positions for pagination
    const startIndex = loadMore ? (pageNumber - 1) * 3 : 0;
    
    // Display different sections only adding new articles to indiaNews for infinite scroll
    displayTopStories(topStoriesData.articles?.slice(0,3), );
    displayLatestNews(latestNewsData.articles?.slice(0.10), );
    displayIndiaNews(indiaNewsData.articles?.slice(startIndex, startIndex + 3), loadMore);
    displayTrendingNews(trendingNewsData.articles?.slice(0, 5)); 
    displayPopularNews(trendingNewsData.articles?.slice(0, 5));

    // Update breaking news ticker on first load
    if (!loadMore && topStoriesData.articles?.length > 0) {
      document.getElementById('breakingNewsTicker').textContent = topStoriesData.articles[0].title;
    }

  } catch (error) {
    console.error('Failed to fetch news:', error);
    document.querySelector('.main-content').innerHTML += '<p class="error-message">Failed to load news. Please try again later.</p>';
  } finally {
    isLoading = false;
  }
}

// Display functions
function displayTopStories(articles, append = false) {
  const container = document.getElementById('topStories');
  if (!append) container.innerHTML = '';
  articles.forEach(article => {
    const articleDate = new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const articleHTML = `
      <article class="news-card">
        ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}" onerror="this.style.display='none'">` : ''}
        <div class="news-content">
          <p class="news-category">${article.source?.name || 'Times of India'}</p>
          <h3 class="news-title"><a href="#" aria-label="${article.title}">${article.title}</a></h3>
          <p class="news-excerpt">${article.description || ''}</p>
          <footer class="news-meta">
            <time datetime="${article.publishedAt}">${articleDate}</time>
            <span><i class="far fa-eye" aria-hidden="true"></i> ${Math.floor(Math.random() * 10) + 1}K views</span>
          </footer>
        </div>
      </article>
    `;
    container.innerHTML += articleHTML;
  });
}

function displayLatestNews(articles, append = false) {
  const container = document.getElementById('latestNews');
  if (!append) container.innerHTML = '';
  articles.forEach(article => {
    const articleDate = new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const articleHTML = `
      <article class="news-card" style="display: flex; margin-bottom: 15px;">
        ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}" style="width: 150px; height: 100px; object-fit: cover;" onerror="this.style.display='none'">` : ''}
        <div class="news-content" style="flex: 1; padding-left: 15px;">
          <p class="news-category">${article.source?.name || 'Times of India'}</p>
          <h3 class="news-title" style="font-size: 16px;"><a href="#" aria-label="${article.title}">${article.title}</a></h3>
          <footer class="news-meta">
            <time datetime="${article.publishedAt}">${articleDate}</time>
          </footer>
        </div>
      </article>
    `;
    container.innerHTML += articleHTML;
  });
}

function displayIndiaNews(articles, append = false) {
  const container = document.getElementById('indiaNews');
  if (!append) container.innerHTML = '';
  articles.forEach(article => {
    const articleDate = new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const articleHTML = `
      <div class="news-card" style="display: flex; margin-bottom: 15px;">
        ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}" style="width: 150px; height: 100px; object-fit: cover;" onerror="this.style.display='none'">` : ''}
        <div class="news-content" style="flex: 1; padding-left: 15px;">
          <div class="news-category">${article.source?.name || 'Times of India'}</div>
          <h3 class="news-title" style="font-size: 16px;"><a href="#">${article.title}</a></h3>
          <div class="news-meta">
            <span>${articleDate}</span>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += articleHTML;
  });
}

function displayTrendingNews(articles, append = false) {
  const container = document.getElementById('trendingNews');
  if (!append) container.innerHTML = '';
  // Take only first 5 articles
  articles.slice(0, 5).forEach((article, index) => {
    const articleHTML = `
      <li>
        <a href="#">
          <span class="number">${index + 1}.</span>
          <span>${article.title}</span>
        </a>
      </li>
    `;
    container.innerHTML += articleHTML;
  });
}

function displayPopularNews(articles) {
  const container = document.getElementById('popularNews');
  container.innerHTML = '';
  articles.forEach((article, index) => {
    const articleHTML = `
      <li>
        <a href="#">
          <span class="number">${index + 1}.</span>
          <span>${article.title}</span>
        </a>
      </li>
    `;
    container.innerHTML += articleHTML;
  });
}

// Simple scroll handler for infinite loading
window.addEventListener('scroll', () => {
  // Check if we're near bottom of page
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
    if (!isLoading) {
      pageNumber++;
      fetchNews(true);
    }
  }
});

// Start the app
fetchNews();
