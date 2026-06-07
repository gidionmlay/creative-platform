# G Design - Creative Studio & Academy Platform

Africa's leading Creative Studio & Academy Platform. Professional design services, structured online courses, and cohort-based bootcamps for creative talent development.

## Project Structure

```
g-design-project/
├── public/                    # Web root directory
│   ├── index.html            # Homepage
│   ├── pages/                # Secondary pages
│   │   ├── about.html
│   │   ├── contact.html
│   │   └── services.html
│   └── assets/               # Static assets
│       ├── css/
│       ├── js/
│       ├── images/
│       ├── fonts/
│       └── inc/              # PHP backend
├── config/                   # Configuration files
│   └── .env.example         # Environment template
├── docs/                     # Documentation
└── src/                      # Source files (for future build process)
```

## Setup

1. Copy `config/.env.example` to `public/assets/inc/.env`
2. Update the SMTP settings in `.env` for email functionality
3. Serve the `public/` directory from your web server

## Features

- Responsive design
- Contact forms with email integration
- Portfolio showcase
- Service offerings
- About page
- Modern UI with animations

## Technologies

- HTML5, CSS3, JavaScript
- Bootstrap framework
- PHP for backend email handling
- GSAP animations
- Font Awesome icons