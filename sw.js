// ===== SERVICE WORKER FOR PWA =====
const CACHE_NAME = 'shristipress-v1.0.0';
const STATIC_CACHE = 'shristipress-static-v1.0.0';
const DYNAMIC_CACHE = 'shristipress-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/script.js',
  '/data/products.json',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

// Files to cache on demand
const CACHE_STRATEGIES = {
  images: 'cache-first',
  api: 'network-first',
  static: 'cache-first'
};

// ===== INSTALL EVENT =====
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// ===== ACTIVATE EVENT =====
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// ===== FETCH EVENT =====
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests that aren't fonts
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('fonts.googleapis.com')) {
    return;
  }

  event.respondWith(
    handleFetchRequest(event.request)
  );
});

// ===== FETCH STRATEGIES =====
async function handleFetchRequest(request) {
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (isImageRequest(request)) {
    return handleImageRequest(request);
  } else if (isAPIRequest(request)) {
    return handleAPIRequest(request);
  } else if (isFontRequest(request)) {
    return handleFontRequest(request);
  } else {
    return handleStaticRequest(request);
  }
}

// ===== IMAGE REQUESTS (Cache First) =====
async function handleImageRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return fallback image if available
    return getFallbackImage();
  }
}

// ===== API REQUESTS (Network First) =====
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// ===== FONT REQUESTS (Cache First) =====
async function handleFontRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Font loading failed:', error);
    throw error;
  }
}

// ===== STATIC REQUESTS (Cache First with Network Fallback) =====
async function handleStaticRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(
        isStaticAsset(request) ? STATIC_CACHE : DYNAMIC_CACHE
      );
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return offline page if available
    if (request.mode === 'navigate') {
      return getOfflinePage();
    }
    throw error;
  }
}

// ===== UTILITY FUNCTIONS =====
function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(request.url);
}

function isAPIRequest(request) {
  return request.url.includes('/api/') || 
         request.url.includes('.json');
}

function isFontRequest(request) {
  return request.destination === 'font' ||
         request.url.includes('fonts.googleapis.com') ||
         /\.(woff|woff2|ttf|eot)$/i.test(request.url);
}

function isStaticAsset(request) {
  return /\.(css|js|html)$/i.test(request.url);
}

async function getFallbackImage() {
  const cache = await caches.open(STATIC_CACHE);
  return cache.match('/assets/images/fallback.svg') || 
         new Response('', { status: 404 });
}

async function getOfflinePage() {
  const cache = await caches.open(STATIC_CACHE);
  return cache.match('/offline.html') || 
         cache.match('/index.html') ||
         new Response('Offline', { 
           status: 200, 
           headers: { 'Content-Type': 'text/html' }
         });
}

// ===== BACKGROUND SYNC =====
self.addEventListener('sync', (event) => {
  if (event.tag === 'newsletter-signup') {
    event.waitUntil(syncNewsletterSignup());
  }
});

async function syncNewsletterSignup() {
  // Handle offline newsletter signups
  try {
    const signups = await getStoredSignups();
    for (const signup of signups) {
      await submitNewsletterSignup(signup);
    }
    await clearStoredSignups();
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// ===== PUSH NOTIFICATIONS =====
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/assets/images/icon-192.png',
    badge: '/assets/images/badge.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/assets/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/images/close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Shristi Press', options)
  );
});

// ===== NOTIFICATION CLICK =====
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// ===== MESSAGE HANDLING =====
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// ===== CACHE MANAGEMENT =====
async function cleanupCaches() {
  const cacheWhitelist = [STATIC_CACHE, DYNAMIC_CACHE];
  const cacheNames = await caches.keys();
  
  return Promise.all(
    cacheNames.map((cacheName) => {
      if (!cacheWhitelist.includes(cacheName)) {
        return caches.delete(cacheName);
      }
    })
  );
}

// ===== HELPER FUNCTIONS FOR DATA PERSISTENCE =====
async function getStoredSignups() {
  // This would typically use IndexedDB
  return [];
}

async function clearStoredSignups() {
  // Clear stored signups after successful sync
}

async function submitNewsletterSignup(signup) {
  // Submit newsletter signup to server
  return fetch('/api/newsletter', {
    method: 'POST',
    body: JSON.stringify(signup),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

console.log('Service Worker: Script loaded');