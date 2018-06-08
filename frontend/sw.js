importScripts('/js/idb.js');
importScripts('/js/dbhelper.js');

const cacheVersion = 'v1';
const cacheData = [
    './',
    'sw.js',
    './index.html',
    './restaurant.html',
    './data/restaurants.json',
    './css/styles.css',
    './js/**.js',
    'imgs/**.jpg',
    './restaurant.html?id=1',
    './restaurant.html?id=2',
    './restaurant.html?id=3',
    './restaurant.html?id=4',
    './restaurant.html?id=5',
    './restaurant.html?id=6',
    './restaurant.html?id=7',
    './restaurant.html?id=8',
    './restaurant.html?id=9',
    './restaurant.html?id=10',
];


// installing the service worker
self.addEventListener('install', (event) => {
    const dataToCache = cacheData;
    return event.waitUntil(caches.open(cacheVersion)
        .then(cache => cache.addAll(dataToCache))
        .catch(err => console.log(err)))
});

// activating the service worker

self.addEventListener('activate', (event) => {
    console.log('Service Worker Activated');
    return event.waitUntil(caches.keys()
        .then((cacheVersions) => {
            // looping through everything in the cache
            return Promise.all(cacheVersions.map((thiscacheVersion) => {
                if (thiscacheVersion !== cacheVersion) {
                    console.log('Removing the old cache');
                    return caches.delete(thiscacheVersion);
                }
            }))
        }));
});

self.addEventListener('fetch', (event) => {
    event.respondWith(caches.match(event.request, {
        ignoreSearch: true,
    }).then((response) => {
        if (response) return response;
        return fetch(event.request);
    }))
});


// self.addEventListener('fetch', (event) => {
//     event.respondWith(caches.match(event.request)
//         .then((response) => {
//             if (response && response !== undefined) return response;
//             return fetch(event.request)
//                 .then((response) => {
//                     console.log(response)
//                     const responseClone = response.clone();
//                     caches.open(cacheVersion)
//                         .then((cache) => {
//                             if (event.request !== 'POST') {
//                                 cache.put(event.request, responseClone)
//                             }
//                         })
//                     return response;
//                 })
//         })
//         .catch(err => console.log(err)));
// });

self.addEventListener('sync', (event) => {
    console.log(event)
    if (event.tag === 'offline-sync') {
        event.waitUntil(DBHelper.postOfflineReview());
    }
})

// Check if online or not
// self.addEventListener('load', () => {
//     const status = document.getElementById('status');
//     const log = document.getElementById('log');

//     const updateOnlineStatus = (event) => {
//         console.log(event)
//         const condition = navigator.onLine ? 'online' : 'offline';
//         status.className = condition;
//         status.innerHTML = condition.toUpperCase();
//         log.insertAdjacentHTML(`beforeend, Event: ${event.type} - Status: ${condition}`);
//     }
//     console.log(log)

//     window.addEventListener(`online: , ${updateOnlineStatus}`);
//     window.addEventListener(`offline, ${updateOnlineStatus}`);
// });