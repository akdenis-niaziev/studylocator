# Study Locator PWA

A modern Progressive Web App (PWA) to discover peaceful study locations where you can focus in silence.

## 📱 Testing on Your Phone (from Localhost)

### Quick Steps:

1. **Make sure your phone and laptop are on the same WiFi network**

2. **Find your laptop's IP address:**

   - **Windows**: Open CMD and type `ipconfig` - look for "IPv4 Address" (e.g., `192.168.1.100`)
   - **Mac**: System Preferences → Network → Your WiFi → IP Address

3. **Start the dev server:**

   ```bash
   npm run dev
   ```

4. **Open the app on your phone:**

   - Open your phone's browser
   - Go to: `http://YOUR_LAPTOP_IP:5173` (e.g., `http://192.168.1.100:5173`)
   - For QR scanning to work, you may need HTTPS. Try using a tunneling service like `ngrok`:
     ```bash
     npx ngrok http 5173
     ```
     Then use the `https://` URL it provides on your phone.

5. **Install as PWA (optional):**
   - On your phone's browser, tap "Add to Home Screen" to install the app

### Troubleshooting:

- **Can't connect?** Check your firewall settings on your laptop
- **Camera not working?** QR scanning requires HTTPS on mobile. Use ngrok or deploy to a hosting service
- **Slow?** Make sure both devices are on the same WiFi

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
- 🔍 **Location Details** - Comprehensive information about each study space
- ⚡ **Fast Data Loading** - TanStack Query for efficient API data management
- 🎨 **Modern UI** - Clean design with Tailwind CSS
- 📴 **PWA Support** - Works offline with service worker caching
- 🚀 **Built with React** - Extensible component architecture

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query v5
- **Maps**: Leaflet & React Leaflet
- **HTTP Client**: Axios
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
├── components/        # React components (Map, LocationCard, etc.)
├── hooks/            # Custom React hooks (useLocations)
├── services/         # API service layer
├── types/            # TypeScript type definitions
├── App.tsx           # Main application component
├── main.tsx          # Application entry point
└── index.css         # Global styles

public/
└── manifest.json     # PWA manifest file

qrcode/               # Standalone QR Check-in System
├── css/             # Styles for QR pages
├── js/              # Logic for check-in demo
├── index.html       # Location selection interface
└── qr-checkin.html  # Check-in confirmation interface
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
