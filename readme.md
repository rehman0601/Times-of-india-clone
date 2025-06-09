# Times of India Clone Documentation

## Project Overview
A responsive web clone of the Times of India news website featuring real-time news updates, breaking news ticker, and mobile-friendly design.

## Table of Contents
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Features](#features)
- [API Integration](#api-integration)
- [Responsive Design](#responsive-design)
- [Setup Instructions](#setup-instructions)
- [Code Documentation](#code-documentation)

## Technologies Used
- HTML5
- CSS3
- JavaScript (ES6+)
- Font Awesome 6.4.0
- News API (via saurav.tech)

## Project Structure
```
Times-of-india-clone/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Features

### 1. Header Components
- Top bar with date/time and social media links
- Logo header with subscription button
- Responsive navigation menu
- Breaking news ticker with animation

### 2. Main Content
- Top Stories section
- Latest News section
- India News section
- Sidebar with trending and popular news
- ePaper promotion

### 3. Footer
- Four-column layout with links
- Copyright information
- Responsive design

## API Integration

### News API Usage
```javascript
const BASE_URL = "https://saurav.tech/NewsAPI/";

// Available endpoints
- /top-headlines/category/general/in.json
- /top-headlines/category/business/in.json
- /top-headlines/category/sports/in.json
- /top-headlines/category/technology/in.json
```

### Error Handling
```javascript
try {
  // API calls
} catch (error) {
  console.error('Error fetching news:', error);
  //displays error
}
```

## Responsive Design

### Breakpoints
```css
/* Desktop first approach */
@media (max-width: 1200px) { /* Large screens */ }
@media (max-width: 992px)  { /* Medium screens */ }
@media (max-width: 768px)  { /* Tablets */ }
@media (max-width: 576px)  { /* Mobile devices */ }
@media (max-width: 360px)  { /* Small mobile devices */ }
```

### Key Responsive Features
- Flexible grid system
- Mobile-friendly navigation
- Responsive images
- Adaptive typography
- Stackable content columns

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Times-of-india-clone.git
```

2. Open the project folder:
```bash
cd Times-of-india-clone
```

3. Open `index.html` in a modern web browser

## Code Documentation

### HTML Structure
```html
<!DOCTYPE html>
<html lang="en">
  <!-- Meta tags and CSS links -->
  <head>...</head>
  <body>
    <!-- Top Bar -->
    <!-- Logo Header -->
    <!-- Navigation -->
    <!-- Breaking News -->
    <!-- Main Content -->
    <!-- Footer -->
  </body>
</html>
```

### CSS Organization
```css
/* Base Styles */
/* Header Styles */
/* Navigation */
/* Main Content */
/* News Cards */
/* Sidebar Styles */
/* Footer Styles */
/* Breaking News Ticker */
/* Responsive Styles */
/* Dark Mode Support */
```

### JavaScript Functions
```javascript
// Core Functions
async function fetchNews()
async function fetchJson(url)

// Display Functions
function displayTopStories(articles)
function displayLatestNews(articles)
function displayIndiaNews(articles)
function displayTrendingNews(articles)
function displayPopularNews(articles)
```

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Performance Considerations
- Lazy loading images
- Minified CSS/JS
- Optimized images
- Error fallbacks
- Responsive images

## Accessibility Features
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast compliance
- Screen reader compatibility

## Future Enhancements
1. Dark mode implementation
2. User authentication
3. Comment system
4. Share functionality
5. Offline support
6. Push notifications

## License
MIT License - feel free to use this project for personal or commercial purposes.