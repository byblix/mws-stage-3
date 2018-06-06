/**
 * Common database helper functions.
 */

class DBHelper {
  /** ‡
   * TODO: Create toggleFavorite func
   * TODO: Create a body to post to indexDB if offline
   * */

  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    console.log(`Fetching restaurants as ${DBHelper.DATABASE_URL}`);

    fetch(DBHelper.DATABASE_URL, {
        method: 'GET',
      })
      .then(restaurants => restaurants.json())
      .then((restaurants) => {
        console.log(restaurants);
        IDBService.insertRestaurantsToDB(restaurants);
        if (restaurants) {
          callback(null, restaurants);
        }
      })
      .catch((err) => {
        console.log(err);
        // Fetch from indexdb incase network is not available
        DBHelper.fetchRestaurantsFromClient(callback);
      });
  }

  static fetchRestaurantsFromClient(callback) {
    console.log('fetching from local IDB!');
    if (!('indexedDB' in window)) {
      console.log('no db');
      return null;
    }
    const dbPromise = idb.open('restaurants', 1, (upgradeDB) => {
      const restaurantStore = upgradeDB.createObjectStore('restaurants', {
        keyPath: 'id',
      });
    });

    dbPromise.then((db) => {
        const tx = db.transaction('restaurants');
        const store = tx.objectStore('restaurants');
        return store.getAll();
      })
      .then((restaurants) => {
        if (restaurants) {
          console.log('indexDB returned this data:');
          console.log(restaurants);
          callback(null, restaurants);
          console.log('fetched from local IDB done');
        }
      });
  }

  static fetchFavoriteRestaurant(id, bool) {
    bool = !bool;
    fetch(`http://localhost:1337/restaurants/${id}/?is_favorite=${bool}`, {
        method: 'POST',
      })
      .then(res => res.json())
      .then((res) => {
        console.log(res)
        IDBService.insertFavoriteResToDB(res.id, bool)
        console.log(`posted fav. restaurant: ${id} ${bool}`)
      })
      .catch(err => console.log(err))
  }

  /**
   * Fetch a restaurant by its ID.
   */

  static fetchRestaurantById(id, callback) {
    console.log(`Fetching restaurants as ${DBHelper.DATABASE_URL}`);
    fetch(`${DBHelper.DATABASE_URL}/${id}`, {
        method: 'GET',
      })
      .then(response => response.json())
      .then((restaurant) => {
        if (restaurant) {
          callback(null, restaurant);
        }
      })
      .catch((err) => {
        console.log(err);
        // Fetch from indexdb incase network is not available
        DBHelper.fetchRestaurantsByIdFromClient(id)
          .then(restaurant => callback(null, restaurant));
      });
  }

  static fetchRestaurantsByIdFromClient(id) {
    console.log('fetching from local IDB!');
    if (!('indexedDB' in window)) {
      console.log('no db');
      return null;
    }
    const dbPromise = idb.open('restaurants', 1, (upgradeDB) => {
      const restaurantStore = upgradeDB.createObjectStore('restaurants', {
        keyPath: 'id',
      });
    });

    dbPromise.then((db) => {
        const tx = db.transaction('restaurants');
        const store = tx.objectStore('restaurants').get(id);
        return store.getAll();
      })
      .then((restaurant) => {
        if (restaurant) {
          console.log('indexDB returned this data from an ID:');
          console.log(restaurant);
          callback(null, restaurant);
          console.log('fetched from local IDB done');
        }
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
        const results = restaurants.filter(r => r.cuisine_type === cuisine);
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
        const results = restaurants.filter(r => r.neighborhood === neighborhood);
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
        let results = restaurants;
        if (cuisine !== 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood !== 'all') { // filter by neighborhood
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
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
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
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/imgs/${restaurant.photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map,
      animation: google.maps.Animation.DROP,
    });
    return marker;
  }

  static selectFavoriteRestaurant(event, form) {
    event.preventDefault();
    const body = {
      restaurant_id: parseInt(form.id.value),
      name: form.dname.value,
      rating: parseInt(form.drating.value),
      comments: form.dreview.value,
      updatedAt: parseInt(form.ddate.value),
      flag: form.dflag.value,
    };
    event;
    // IDBHelper.idbPostReview(form.id.value, body);
    // location.reload();
  }

}