
/**
 * Register Service Worker.
 */
if ('serviceWorker' in navigator){
  window.addEventListener('load', function () {
  navigator.serviceWorker
    .register('./serviceworker.js')
    .then(function(registration) {
      console.log('Success registration worked!', registration);
    })
    .catch(function(err) {
      console.log('Registration failed!', err);
    })
  })
}