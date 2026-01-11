# Study Locator PWA

A modern Progressive Web App (PWA) to discover peaceful study locations where you can focus in silence. Features gamification, QR code check-ins, and an interactive map.

## 📱 Testing on Your Phone (from Localhost)

### Quick Steps:

1. **Make sure your phone and laptop are on the same WiFi network**

2. **Start the dev server:**

   ```bash
   npm run dev
   ```

   This will start a secure server (HTTPS) at `https://YOUR_LAPTOP_IP:5173`.

3. **Open the app on your phone:**

   - Open your phone's browser
   - Go to the URL shown in the terminal (e.g., `https://192.168.1.100:5173`)
   - **Note:** You will likely see a "Your connection is not private" warning because we are using a self-signed certificate for local development. This is normal. Click "Advanced" -> "Proceed to..." to access the app.
   - 📸 **Camera access:** HTTPS is required for QR scanning to work on mobile devices.

4. **Install as PWA (optional):**
   - On your phone's browser, tap "Add to Home Screen" to install the app for a native-like experience.

---

## Table of Contents

- [Study Locator PWA](#study-locator-pwa)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Building for Production](#building-for-production)
    - [Preview Production Build](#preview-production-build)
  - [Project Structure](#project-structure)
  - [API Integration](#api-integration)
  - [Features Explained](#features-explained)
    - [Map Component](#map-component)
    - [Location List](#location-list)
    - [Details Panel](#details-panel)
    - [QR Code Module](#qr-code-module)
  - [Customization](#customization)
    - [Styling](#styling)
    - [Adding New Features](#adding-new-features)
  - [Performance](#performance)
  - [PWA Installation](#pwa-installation)
  - [License](#license)
  - [Support](#support)

## Features

- 🗺️ **Interactive Map** - Real-time Leaflet map showing study locations
- 📱 **Responsive Design** - Works seamlessly on mobile, tablet, and desktop
- 🔍 **Location Details** - Comprehensive information about each study space including quietness levels and amenities
- 🎮 **Gamification** - Earn badges, XP, and level up by checking into study spots
- 📷 **In-App QR Scanner** - Verify your presence and unlock rewards by scanning codes
- 📊 **Dashboard** - Track your study habits, visits, and progress
- ⚡ **Fast Data Loading** - TanStack Query for efficient API data management
- ✨ **Fluid Animations** - Powered by Framer Motion for a polished user experience
- 📴 **PWA Support** - Installable on devices with offline capabilities
- 🚀 **Built with React** - Extensible component architecture

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Maps**: Leaflet & React Leaflet (with Routing Machine)
- **State Management**: TanStack Query v5 & React Context
- **QR Scanning**: html5-qrcode
- **Language**: TypeScript
- **PWA**: Vite PWA Plugin

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/        # React components (Dashboard, Map, Profile, QRScanner, etc.)
├── contexts/         # React Contexts (Auth, Theme, etc.)
├── hooks/            # Custom React hooks (useLocations)
├── services/         # API service layer (checkIn, gamification, location, review)
├── types/            # TypeScript type definitions
├── App.tsx           # Main application component
├── main.tsx          # Application entry point
└── index.css         # Global styles

public/
└── manifest.json     # PWA manifest file
```

## API Integration

The app is set up to integrate with study location APIs. Currently uses mock data for development. To connect to a real API:

1. Update the endpoint in `src/services/locationService.ts`
2. Modify the response handling to match your API structure
3. The data will automatically be cached and managed by TanStack Query

## Features Explained

### Map Component

- Displays all study locations with markers
- Click markers to view location details in a popup
- Responsive to location selection from the sidebar

### Location List

- Vertical list of all available study locations
- Click to select and view details
- Visual feedback for selected location
- Loading states

### Details Panel

- Shows comprehensive information about selected location
- Displays amenities, hours, and address
- Responsive: hidden on small screens, visible on desktop

### QR Code Module

The `/qrcode` folder contains a standalone web interface for testing and demonstrating the physical check-in process. content includes:

- **index.html**: A searchable list of locations to simulate approaching a location.
- **qr-checkin.html**: A confirmation page that simulates a successful scan/check-in action.
- **Standalone CSS/JS**: Independent of the main React app for lightweight deployment on kiosk devices.

## Customization

### Styling

- Colors and theme in `tailwind.config.js`
- Global styles in `src/index.css`
- Component-specific styles using Tailwind classes

### Adding New Features

The component-based architecture makes it easy to:

- Add new screens/pages
- Create additional components
- Extend the API service
- Modify data types

## Performance

- **Code Splitting**: Automatic with Vite
- **Lazy Loading**: React components can be lazy-loaded
- **Caching**: TanStack Query caches API responses
- **Service Worker**: Offline support and asset caching

## PWA Installation

Users can install the app on their device:

- **Desktop**: Click the install icon in the address bar
- **Mobile**: Use the browser menu → "Install app"
- **Standalone**: Launches like a native app

## License

MIT

## Support

For issues or feature requests, please create an issue in the project repository.
