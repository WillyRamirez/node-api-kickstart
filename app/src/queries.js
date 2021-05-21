const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const getValidationRules = require('./Validations');

const Pool = require('pg').Pool;

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: 'postgres',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
let refreshTokenBlacklist = [];

const login = async(request, response) => {
  const validations = getValidationRules(alreadyExists).login;
  await Promise.all(validations.map(validation => validation.run(request)));

  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }

  const { email, password } = request.body;
  pool.query('SELECT ID, first_name, last_name, username, email FROM users WHERE email = $1 AND PASSWORD = crypt($2, password)',
    [email, password],
    (error, results) => {
    if (error) {
      throw error
    }

    if (results?.rows.length > 0) {
      const userData = { id: results.rows[0].id, email: results.rows[0].email };
      const accessToken = jwt.sign(userData, accessTokenSecret, {expiresIn: "15 minutes"});
      const refreshToken = jwt.sign(userData, refreshTokenSecret, {expiresIn: "90 days"})

      response.status(200).json({ accessToken, refreshToken, user: results.rows });
    } else {
      response.status(401).json({error: "unauthorized"});
    }
  })
};

const isAdmin = (req, res, next, userId) => {
  pool.query('SELECT is_admin FROM users WHERE id = $1', [userId], (error, results) => {
    if (error) {
      throw error
    }

    if (results.rows.length > 0) {
      const isAdmin = results.rows[0].is_admin;

      if (isAdmin) {
        next();
      } else {
        res.status(401).json({error: "unauthorized"});
      }
    } else {
      res.status(401).json({error: "unauthorized"});
    }
  })
}

const alreadyExists = (key, value) => {
  pool.query('SELECT $1 FROM users WHERE $1 = $2', [key, value], (error, results) => {
    if (error) {
      throw error
    }

    return results.rows.length > 0;
  });
};

const getUsers = (request, response) => {
  pool.query('SELECT id, first_name, last_name, username, email FROM users ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
};

const getUserById = (request, response) => {
  const { id } = request.params;

  pool.query('SELECT first_name, last_name, username, email FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }

    response.status(200).json(results.rows)
  })
};

const createUser = async (request, response) => {
  const validations = getValidationRules(alreadyExists).user;
  await Promise.all(validations.map(validation => validation.run(request)));

  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }

  const { first_name, last_name, username, email, password } = request.body

  pool.query('INSERT INTO users (first_name, last_name, username, email, password) VALUES ($1, $2, $3, $4, crypt($5, gen_salt(\'bf\'))) RETURNING id',
    [first_name, last_name, username, email, password],
    (error, results) => {
      if (error) {
        throw error
      }

      if (results.rows.length > 0) {
        pool.query('SELECT first_name, last_name, username, email FROM users WHERE id = $1', [results.rows[0].id], (error, results) => {
          if (error) {
            throw error
          }
          const userData = { id: results.rows[0].id, email: results.rows[0].email };
          const accessToken = jwt.sign(userData, accessTokenSecret, {expiresIn: "15 minutes"});
          const refreshToken = jwt.sign(userData, refreshTokenSecret, {expiresIn: "90 days"})

          response.status(200).json({ accessToken, refreshToken, user: results.rows[0] });
        })
      }
    })
};

const updateUser = (request, response) => {
  const id = parseInt(request.params.id)
  const { name, email } = request.body

  pool.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3',
    [name, email, id],
    (error, results) => {
      if (error) {
        throw error
      }

      response.status(200).send(`User modified with ID: ${id}`)
    }
  )
};

const deleteUser = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`User deleted with ID: ${id}`)
  })
};

const generateNewAccessToken = (request, response) => {
  const { token } = request.body;

  if (!token) {
    return response.sendStatus(401);
  }

  if (refreshTokenBlacklist.includes(token)) {
    return response.sendStatus(403);
  }

  jwt.verify(token, refreshTokenSecret, (err, user) => {
    if (err) {
      return response.sendStatus(403);
    }

    const userData = { id: user.id, email: user.email };
    const accessToken = jwt.sign(userData, accessTokenSecret, {expiresIn: "15 minutes"});

    response.json({
      accessToken
    });
  });
}

const logout = (request, response) => {
  const { refreshToken } = request.body;
  refreshTokenBlacklist.push(refreshToken);

  response.send("Logout successful");
};

module.exports = {
  login,
  logout,
  generateNewAccessToken,
  isAdmin,
  alreadyExists,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
