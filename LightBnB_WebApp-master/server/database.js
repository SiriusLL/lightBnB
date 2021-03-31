const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require("pg");


const pool = new Pool({
  user: "vagrant",
  password: "123",
  host: "localhost",
  database: "lightbnb",
});

pool.query(`
SELECT *
FROM properties
LIMIT 5;
`)
.then(res => {
  console.log('working')
})
.catch(err => console.error('query error', err.stack));

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool.query(`
    SELECT *
    FROM users
    WHERE email = $1;
    `, [email])
  .then(function(res) {
    if (res.rows.length === 0) {
      return null;
    }
    return res.rows[0]
  });
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool.query(`
    SELECT *
    FROM users
    WHERE id = $1;
    `, [id])
  .then(function(res) {
    if (res.rows.length === 0) {
      return null;
    }
    return res.rows[0]
  });   
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  return pool.query(`
  INSERT INTO users (name, email, password)
  VALUES ($1, $2, $3)
  RETURNING *;
  `, [user.name, user.email, user.password])
  .then(function(res) {
    console.log('this is the chosen one----------------------------->', res.rows[0])
    if (res.rows.length === 0) {
      return null;
    }
    return res.rows[0]
  }); 
}
// addUser(getUserWithId(1));
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return pool.query(`
  SELECT properties.id, properties.title, properties.cost_per_night, reservations.start_date, reservations.end_date, AVG(property_reviews.rating) as average_rating
FROM reservations
JOIN properties ON property_id = properties.id
JOIN property_reviews ON properties.id = property_reviews.property_id
WHERE reservations.guest_id = $1 AND start_date < now()::date
GROUP BY properties.id, reservations.id
ORDER BY start_date
LIMIT $2;
  `, [guest_id, limit])
  .then(function(res) {
    console.log('this is the chosen two----------------------------->', res.rows)
    if (res.rows.length === 0) {
      return null;
    }
    return res.rows
  }); 
}
exports.getAllReservations = getAllReservations;
// rows:
//    [ { id: 934,
//        title: 'Secret take',
//        cost_per_night: 31345,
//        start_date: 2014-09-23T00:00:00.000Z,
//        average_rating: '4.3333333333333333' },
//      { id: 923,
//        title: 'Nearer guide',
//        cost_per_night: 58276,
//        start_date: 2015-11-26T00:00:00.000Z,
//        average_rating: '4.2000000000000000' },
//      { id: 887,
//        title: 'Peace brown',
//        cost_per_night: 25636,
//        start_date: 2018-04-11T00:00:00.000Z,
//        average_rating: '4.2500000000000000' },
//      { id: 387,
//        title: 'Difficult stopped',
//        cost_per_night: 4444,
//        start_date: 2018-05-20T00:00:00.000Z,
//        average_rating: '3.5555555555555556' },
//      { id: 786,
//        title: 'Care bowl',
//        cost_per_night: 22997,
//        start_date: 2020-01-01T00:00:00.000Z,
//        average_rating: '4.8000000000000000' } ]
/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  return pool.query(`
    SELECT *
    FROM properties
    LIMIT $1;
    `, [limit])
  .then(res => res.rows)
  .catch(err => console.error(err));
}
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
