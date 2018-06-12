/**
 * Indexed DB service handler
 */

class IDBService {
    /**
     * 1. insertRestaurantsToDb()
     * 2. Check for database exists?
     * 3. offline site?: https: //developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/Online_and_offline_events
     */

    static getDBPromise() {
        // If db exists or create one
        return idb.open('restaurants', 1, upgradeDB => {
            upgradeDB.createObjectStore('restaurants', {
                keyPath: 'id',
                autoIncrement: true
            });
        });
    }

    static getAllIDBData() {
        this.getDBPromise().then(db => {
            return db.transaction('restaurants').objectStore('restaurants').getAll();
        });
    }

    // static deleteOldDatabase() {
    //     const DBDeleted = window.indexedDB.deleteDatabase('restaurants');
    //     DBDeleted.onerror = (e) => {
    //         console.log(e);
    //     };
    //     DBDeleted.onsuccess = (e) => {
    //         console.log(e);
    //     };
    // }

    /**
     * Populate restaurants data including reviews
     */
    static fetchReviews(restaurant, dbPromise) {
        const id = restaurant.id;
        fetch(`http://localhost:1337/reviews/?restaurant_id=${id}`).then(res => res.json()).then(res => console.log(res)).then(restaurantReviews => dbPromise.then(db => {
            const tx = db.transaction('restaurants', 'readwrite');
            const store = tx.objectStore('restaurants');
            const item = restaurant;
            item.reviews = restaurantReviews;
            store.put(item);
            return tx.complete;
        }));
    }

    static fetchReviewsFromId(id) {
        console.log(id);
        fetch(`${DBHelper.DATABASE_URL}/reviews/?restaurant_id=${id}`).then(res => res.json()).then(res => console.log(res)).catch(err => console.log(err));
    }

    static insertRestaurantsToDB(restaurants) {
        this.getDBPromise().then(db => {
            console.log('inserting to idb');
            const tx = db.transaction('restaurants', 'readwrite');
            const store = tx.objectStore('restaurants');
            restaurants.forEach(restaurant => {
                store.get(restaurant.id).then(indexRestaurant => {
                    if (JSON.stringify(restaurant) !== JSON.stringify(indexRestaurant)) {
                        store.put(restaurant).then(success => console.log(`Worked IDB updated restaurant: , ${restaurant}, ${success}`));
                    }
                });
            });
        });
    }

    static instertSpecificRestaurantToDB(id) {
        this.getDBPromise().then(db => {
            const tx = db.transaction('restaurants', 'readwrite');
            const store = tx.objectStore('restaurants');
            console.log(store);
            store.get(id).then(restaurant => {
                if (restaurant) {
                    console.log(restaurant);
                    console.log(id);
                    store.put(restaurant);
                    return tx.complete;
                }
            });
        });
    }

    static insertUserReviewToDB(id, body) {
        const dbPromise = idb.open('reviews', 1, upgradeDB => {
            upgradeDB.createObjectStore('reviews', {
                keyPath: 'id',
                autoIncrement: true
            });
        });

        console.log('insert review to DB an online connection');
        dbPromise.then(db => {
            const tx = db.transaction('reviews', 'readwrite');
            const store = tx.objectStore('reviews');
            console.log(id);
            store.put(body).then(success => console.log(`Reviews , ${restaurant}, ${success}`));
        });
    }

    static insertOfflineUserReviewToDB(id, body) {
        const dbPromise = idb.open('sync-reviews', 1, upgradeDB => {
            upgradeDB.createObjectStore('sync-reviews', {
                keyPath: 'id',
                autoIncrement: true
            });
        });
        console.log('insert review to DB a user without connection');
        dbPromise.then(db => {
            const tx = db.transaction('sync-reviews', 'readwrite');
            const store = tx.objectStore('sync-reviews');
            console.log(id);
            store.put(body).then(success => console.log(`Reviews , ${restaurant}, ${success}`));
        });
    }
}