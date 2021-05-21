const db = require('./queries');

const alreadyExists = db.alreadyExists

module.exports = {
  alreadyExists
};
