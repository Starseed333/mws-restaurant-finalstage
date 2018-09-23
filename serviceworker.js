const staticCacheName = 'restaurant-reviews-v1';
//file images | scripts
const cached_urls = [
  '/',
  'restaurant.html',
  'css/styles.css',
  'css/responsiveStyle.css',
  'img/1.webp',
  'img/2.webp',
  'img/3.webp',
  'img/4.webp',
  'img/5.webp',
  'img/6.webp',
  'img/7.webp',
  'img/8.webp',
  'img/9.webp',
  'img/undefined.webp',
  'js/idb.js',
  'js/dbhelper.js',
  'js/main.js',
  'js/restaurant_info.js'
]

// cache
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll(cached_urls);
    })
  );
});

// Retrieve data from cache
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open(staticCacheName).then(function(cache){
      return cache.match(event.request).then(function(response){
        return response || fetch(event.request).then(function(response){
          cache.put(event.request, response.clone());
            console.log("new data included to cache", event.request.url);
            return response;
        }).catch(function(error){
            console.log("Error!! ", error);
        });
      });
    })
  );
});

//delete old cache
self.addEventListener('activate', function(event) {
  console.log("Success sw activated!!!");
  event.waitUntil(
    caches.keys().then(function(cacheNames){
      return Promise.all(
        cacheNames.filter(function(cacheName){
          return cacheName.startsWith('restaurant-reviews-') &&
        cacheName != staticCacheName;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

//fetch | error
self.addEventListener('fetch', function(event) {
  console.log("...Service Worker initiating the fetch!");
  event.respondWith(
    fetch(event.request).then(function(response){
      if (response.status == 404){
        return new Response ("Sorry no file!");
      }
      return response;
    }).catch(function(){
      //offline
      return new Response("Epic Fail");
    })
  );
});
