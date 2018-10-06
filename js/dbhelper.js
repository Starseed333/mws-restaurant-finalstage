/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants/`;
  }
  // Retrieve reviews
  static get DATABASE_REVIEWS_URL() {
    const port = 1337
    return `http://localhost:${port}/reviews`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    DBHelper.openDatabase().then(function(db) {
      const store = db.transaction(['restaurants']).objectStore('restaurants');
      store.getAll().then(function(data) {
        if (data.length > 0) {
          callback(null, data);
        } else {
          fetch(DBHelper.DATABASE_URL)
          .then(function(response) {
            return response.json();
          })
          .then(function(json) {
            DBHelper.openDatabase().then(function(db) {
              const tx = db.transaction(['restaurants'], 'readwrite');
              const store = tx.objectStore('restaurants');
              json.forEach(restaurant => {
                store.put(restaurant);
              });
            });
            callback(null, json);
          })
          .catch(error => {
            const errorResponse = (`Request failed. Return the status of ${error}`);
            callback(errorResponse, null);
          });
        }
      });
    });

  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    DBHelper.openDatabase().then(function(db) {
      const store = db.transaction(['restaurants']).objectStore('restaurants');
      store.get(parseInt(id)).then(function(data) {
        if (data) {
          callback(null, data);
        } else {
          DBHelper._fetchRestaurantByIdAndAddToDb(id, callback);
        }
      });
    });
  }

  /**
   * Fetch a restaurant by its ID and add it to the database
   */
  static _fetchRestaurantByIdAndAddToDb(id, callback) {
    fetch(`${DBHelper.DATABASE_URL}/${id}`)
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      DBHelper.openDatabase().then(function(db) {
        const tx = db.transaction(['restaurants'], 'readwrite');
        const store = tx.objectStore('restaurants');
        store.put(json);
      });
      callback(null, json);
    })
    .catch(error => {
      const errorResponse = (`Request failed. Return the status of ${error}`);
      callback(errorResponse, null);
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }
  static fetchReviews(id, callback) {
    DBHelper.openDatabase().then(db => {
      const tx = db.transaction(['reviews'], 'readwrite');
      const store = tx.objectStore('reviews');
      store.get(id).then(data => {
        if (data) {
          callback(null, data);
          // If newer data available from server, fetch and display that.
          DBHelper._fetchReviewsAndAddToDB(id, callback);
        } else {
          DBHelper._fetchReviewsAndAddToDB(id, callback);
        }
      })
    });
  }

  static _fetchReviewsAndAddToDB(id, callback) {
    fetch(DBHelper.DATABASE_REVIEWS_URL + `/?restaurant_id=${id}`)
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      DBHelper.openDatabase().then(db => {
        const tx = db.transaction(['reviews'], 'readwrite');
        const store = tx.objectStore('reviews');
        store.delete(id);
        store.put(json, id);
      });
      callback(null, json);
    })
    .catch(error => {
      const errorResponse = (`Failed to fetch review from restaurant id: ${id}`);
      callback(errorResponse, null);
    });
  }


  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }
  static ariaForRestaurant(restaurant) {
    // console.log (`${restaurant.name}`);
    return (`${restaurant.name}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}.webp`);
  }
  static imageALTForRestaurant(restaurant) {
    return (`${restaurant.alt_text}`);
  }


  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  }
  /**
   * POST a review to the database
   */
  static postRestaurantReview(postData) {
    const postURL = 'http://localhost:1337/reviews'
    fetch(postURL, {
      method: 'POST',
      body: JSON.stringify(postData),
      headers : {'Content-Type': 'application/json'}
    })
    .then(response => {
      return response.json();
    })
    .then(json => {
      // Confirm review submission
      console.log(json);
    })
    .catch(error => {
      // If not catch the error
      console.log(error);
      DBHelper.openDatabase().then(function(db) {
        const tx = db.transaction(['offline-reviews'], 'readwrite');
        const store = tx.objectStore('offline-reviews');
        store.put(postData);
      });
    });
  }

  /**
   * Get pending reviews
   */
  static getPendingReviews(callback) {
    DBHelper.openDatabase().then(function(db) {
      const store = db.transaction(['offline-reviews'], 'readwrite')
      .objectStore('offline-reviews');
      store.getAll().then(function(data) {
        if (data.length !== 0) {
          store.clear().then(() => {
            callback(null, data);
          })
        }
      })
    });
  }
  static openDatabase() {
    if (!'serviceWorker' in navigator) {
      return Promise.resolve();
    }
  
    return idb.open('restaurantreviews', 1, function(upgradeDb) {
      const restaurants = upgradeDb.createObjectStore('restaurants', {
        keyPath: 'id'
      });

      const offlineReviews = upgradeDb.createObjectStore('offline-reviews', {
        autoIncrement: true
      });

      const offlineFavorites = upgradeDb.createObjectStore('offline-favorites', {
        keyPath: 'id'
      });

      const reviews = upgradeDb.createObjectStore('reviews', {autoIncrement: true});
    });
  }

}