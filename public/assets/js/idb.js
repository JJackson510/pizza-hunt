let db;
//establish a connection to IndexDB database called "pizza_hunt"
const request = indexedDB.open('pizza_hunt', 1);

//this event will emit if the db version is changed
request.onupgradeneeded = function(event) {
    //save a reference to the db
    const db =event.target.result;
    //create an onject store (table) caled `new_pizza`, set it to have an auto incremention primary keyof sorts
    db.createObjectStore('new_pizza', {autoIncrement: true});
    //apon a successful
    request.onsuccess = function(event) {
        //when db is successfully created with its object store, or simply established a connection, save reference to db in global variable
        db = event.target.result;

        //check if app is online, if yes run uploadPizza() function to send all local db data to api
        if(navigator.onLine) {
            //we have not created this yet, comment it out 
            uploadPizza();
        }
    };
    request.onerror = function(event) {
        //log error here 
        console.log(event.target.errorCode);
    };
};

//This function will be executed if we attempt to submit a new pizz with no internet connection
function saveRecord(record) {
    //open a new transactionwith the db with read and write permissions
    const transaction =db.transaction(['new_pizza', 'readwrite']);

    //access the object store for `new_pizza`
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    //add record to your store with add method
    pizzaObjectStore.add(record);
};

function uploadPizza() {
    //open a transaction with the db 
    const transaction = db.transaction(['new_pizza', 'readwrite']);

    //access your object store
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    //get all records from store and set to a variable
    const getAll =pizzaObjectStore.getAll();

    getAll.onsuccess = function() {
        // if there was data in the indexDB store, lets send it to the api server
        if(getAll.result.length > 0) {
            fetch('/api/pizzas', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message) {
                    throw new Error(serverResponse);
                }
                // open one more transaction
                const transaction = db.transaction(['new_pizza'], 'readwrite');
                //access the new_pizza object objectStore
                const pizzaObjectStore = transaction.objectStore('new_pizza');
                // clear all items in your store
                pizzaObjectStore.clear();

                alert('All saved pizza had been submitted!');
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
};

//;isten for app coming back online
window.addEventListener('online',uploadPizza);