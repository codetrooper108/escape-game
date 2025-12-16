# PWA Setup Instructions

This app is now a Progressive Web App (PWA) that can be installed on mobile devices!

## Features

✅ **Installable** - Add to home screen on Android and iOS  
✅ **Offline Support** - Works offline with cached content  
✅ **App-like Experience** - Full screen, no browser UI  
✅ **Fast Loading** - Service worker caches assets  

## Installation

### Android/Chrome

1. Visit the app in Chrome browser
2. Look for the install prompt (or tap the menu → "Install app")
3. Tap "Install"
4. The app will appear on your home screen

### iOS/Safari

1. Visit the app in Safari
2. Tap the Share button (⎋) at the bottom
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" in the top right
5. The app will appear on your home screen

## Development

### Testing PWA Features

1. **Service Worker**: Check browser DevTools → Application → Service Workers
2. **Manifest**: Check DevTools → Application → Manifest
3. **Offline Mode**: DevTools → Network → Check "Offline" checkbox

### Generating Icons

Icons are required for the PWA. See `public/icons/README.md` for instructions.

Quick method:
1. Open `public/generate-icons.html` in browser
2. Click "Generate Icons"
3. Save icons to `public/icons/` directory

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

### Deployment Notes

- Ensure HTTPS is enabled (required for service workers)
- Service worker will cache assets for offline use
- Update `CACHE_NAME` in `service-worker.js` when deploying new versions

## Troubleshooting

### Service Worker Not Registering

- Check browser console for errors
- Ensure you're using HTTPS (or localhost for development)
- Clear browser cache and reload

### Install Prompt Not Showing

- Check if app is already installed
- Ensure manifest.json is accessible
- Check browser DevTools → Application → Manifest for errors

### Icons Not Showing

- Verify icons exist in `public/icons/` directory
- Check manifest.json icon paths are correct
- Clear browser cache

## Browser Support

- ✅ Chrome/Edge (Android & Desktop)
- ✅ Safari (iOS 11.3+)
- ✅ Firefox (Android)
- ⚠️ iOS Safari requires manual "Add to Home Screen"

