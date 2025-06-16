# Times of India Clone

A modern web application clone of the Times of India news website built with vanilla JavaScript, featuring real-time news updates, comments, and text-to-speech functionality.

## Features

- 📰 Real-time news updates across multiple categories
- 🔊 Text-to-speech for article reading
- 💬 Comment system with likes
- 👤 User authentication
- 📱 Responsive design
- ♾️ Infinite scroll loading
- 🔴 Live breaking news ticker

## Tech Stack

- Vanilla JavaScript (ES6+)
- HTML5 & CSS3
- News API
- Web Speech API
- LocalStorage for data persistence

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/rehman0601/times-of-india-clone.git
cd times-of-india-clone
```

2. Start a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

3. Open in browser:
```
http://localhost:8000
```

## Project Structure

```
times-of-india-clone/
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── services/
│       │   └── services.js
│       ├── main.js
│       └── category.js
├── pages/
│   ├── latest/
│   ├── india/
│   ├── world/
│   ├── business/
│   ├── sports/
│   └── tech/
└── index.html
```

## Features Details

### Text-to-Speech
- Click on the speaker icon to listen to articles
- Pause/Resume functionality
- Works across all news sections

### User Features
- User registration and login
- Comment on articles
- Like and interact with comments
- Persistent user sessions

### News Categories
- Latest News
- India News
- World News
- Business
- Sports
- Technology

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [News API](https://saurav.tech/NewsAPI/) for providing news data
- Times of India for design inspiration
- Font Awesome for icons