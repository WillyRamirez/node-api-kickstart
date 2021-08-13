const jwt = require('jsonwebtoken');
const db = require('./queries');
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

const isAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, accessTokenSecret, (err, user) => {

      if (err) {
        return res.status(403).json(err);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

const isAdmin = (req, res, next) => {
  const { id } = req.user;

  db.isAdmin(req, res, next, id);
};

module.exports = {
  isAuth,
  isAdmin,
};
