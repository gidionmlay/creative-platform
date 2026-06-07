# G Design Project Documentation: A Beginner's Guide

Welcome to the comprehensive guide for the **G Design** project. This document explains how the platform was built, the technologies used, and how everything fits together. It is designed to be easily understood by someone just starting with web development.

---

## 1. Project Overview
**G Design** is Africa's leading Creative Studio & Academy Platform. It serves two main purposes:
- **Studio**: Providing professional design and production services to clients.
- **Academy**: Offering structured online courses and intensive bootcamps to develop creative talent.

The website is a modern, responsive, and highly interactive platform designed to showcase professional work while providing a seamless user experience for students and clients alike.

---

## 2. Technologies Used
The project uses a blend of classic web technologies and modern libraries to achieve its premium look and feel.

### Core Technologies:
- **HTML5**: The backbone of the website, used for structure and content.
- **CSS3**: Used for styling, layout, and visual design.
- **JavaScript**: Used for interactivity and dynamic content.
- **PHP**: Handles backend tasks like sending emails from contact forms.

### Frameworks & Libraries:
- **Bootstrap**: A CSS framework that makes the site responsive (it looks good on phones, tablets, and computers).
- **jQuery**: A JavaScript library that simplifies tasks like DOM manipulation and event handling.
- **GSAP (GreenSock Animation Platform)**: A powerful library for creating high-quality, high-performance animations.
- **Swiper & Owl Carousel**: Used for creating smooth, touch-enabled sliders and carousels (e.g., for testimonials and portfolios).
- **AOS (Animate On Scroll)**: Adds animations that trigger as you scroll down the page.
- **Font Awesome & Flaticon**: Used for the various icons found throughout the site.

---

## 3. Project Structure
The files are organized logically to make the project easy to maintain.

```text
G DESIGN/
├── config/                 # Configuration files (e.g., .env template)
├── docs/                   # Documentation and guides
├── public/                 # The main folder served to the web
│   ├── index.html          # The homepage
│   ├── pages/              # Other website pages (About, Services, Contact, etc.)
│   └── assets/             # Static files used by the pages
│       ├── css/            # Stylesheets (both custom and libraries)
│       ├── js/             # JavaScript files and libraries
│       ├── images/         # Photos, logos, and graphics
│       ├── fonts/          # Custom typography
│       └── inc/            # PHP backend scripts for forms
└── src/                    # Original source files (for future development)
```

---

## 4. Development Process & Implementation

### A. Responsive Design
The site uses a **mobile-first** approach. By using **Bootstrap**, the layout automatically adjusts based on the screen size. For example, a three-column layout on a desktop might stack into a single column on a smartphone.

### B. Interactive Animations
One of the standout features of G Design is its animations.
- **Preloader**: A custom loading animation shown while the site assets are being fetched.
- **Scroll Animations**: Using **GSAP** and **AOS**, elements fade in, slide, or zoom as the user interacts with the page, making it feel "alive."
- **Custom Cursor**: A unique visual touch that replaces the standard mouse pointer with a stylized circle that reacts to clicks.

### C. Backend Functionality
While most of the site is static (HTML/CSS), the contact forms require a backend to process data.
- **PHP Scripts**: Located in `public/assets/inc/`, these scripts take the information entered into forms and send it via email to the site administrators.
- **Environment Variables**: Sensitive information (like email server settings) is stored in a `.env` file for security.

---

## 5. Key Components

### Navigation (Header)
The navigation bar is sticky (it stays at the top when you scroll) and features a mobile-friendly "hamburger" menu for smaller screens.

### Sliders (Carousels)
Sections like "Trusted by Leading African Businesses" use **Swiper** to create infinite looping carousels of logos.

### Modals & Popups
The "Play Video" buttons use **Magnific Popup** to open videos in an overlay without leaving the current page.

---

## 6. How to Set Up Locally (For Beginners)

If you want to run this project on your own computer:

1. **Prerequisites**: You need a local server environment (like XAMPP, WAMP, or MAMP) because the site uses PHP for contact forms.
2. **Copy Files**: Place the entire `G DESIGN` folder into your server's root directory (e.g., `htdocs` in XAMPP).
3. **Configuration**:
   - Go to `config/` and copy `.env.example` to `public/assets/inc/.env`.
   - Open `.env` and fill in your SMTP (email server) details if you want the contact forms to work.
4. **Access**: Open your web browser and navigate to `http://localhost/G DESIGN/public/`.

---

## 7. Future Growth
The project includes a `src/` directory, which is intended for future transitions to a build process (like Vite or Webpack), allowing for even more optimized performance and modern development workflows as the platform scales.
