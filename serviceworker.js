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

self.addEventListener('fetch', function(event) {
	if (event.request.url.indexOf('restaurant.html') > -1) {
		event.respondWith(
			caches.match('restaurant.html')
			.then(function(response) {
				if (response) return response;
				return fetch(event.request);
			})
			.catch(function(error) {
				console.error('Error in restaurant.html!');
				console.error(error);
				console.error(event.request);
			})
		);
	} else {
		event.respondWith(
			caches.match(event.request)
			.then(function(response) {
				if (response) return response;
				return fetch(event.request);
			})
			.catch(function(error) {
				console.error('Error in caches.match');
				console.error(error);
				console.error(event.request);
			})
		);
	}
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
