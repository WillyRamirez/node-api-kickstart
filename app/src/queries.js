const jwt = require('jsonwebtoken');
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
let refreshTokens = [];

const login = (request, response) => {
  const { email, password } = request.body;
  pool.query('SELECT ID, first_name, last_name, username, email FROM users WHERE email = $1 AND PASSWORD = crypt($2, password)',
    [email, password],
    (error, results) => {
    if (error) {
      throw error
    }

    if (results?.rows.length > 0) {
      const userData = { id: results.rows[0].id, email: results.rows[0].email };
      const accessToken = jwt.sign(userData, accessTokenSecret, {expiresIn: "1 hour"});
      const refreshToken = jwt.sign(userData, refreshTokenSecret, {expiresIn: "90 days"})

      refreshTokens.push(refreshToken);
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

const getUsers = (request, response) => {
  pool.query('SELECT id, first_name, last_name, username, email FROM users ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
};

const getUserById = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('SELECT first_name, last_name, username, is_admin, email FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
};

const createUser = (request, response) => {
  const { first_name, last_name, username, email } = request.body

  pool.query('INSERT INTO users (first_name, last_name, username, email) VALUES ($1, $2, $3, $4)', [first_name, last_name, username, email], (error, results) => {
    if (error) {
      throw error
    }
    response.status(201).send(`User added with ID: ${results.insertId}`)
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

  if (!refreshTokens.includes(token)) {
    return response.sendStatus(403);
  }

  jwt.verify(token, refreshTokenSecret, (err, user) => {
    if (err) {
      return response.sendStatus(403);
    }

    const userData = { id: user.id, email: user.email };
    const accessToken = jwt.sign(userData, accessTokenSecret, {expiresIn: "1 hour"});

    response.json({
      accessToken
    });
  });
}

const logout = (request, response) => {
  const { refresh_token } = request.body;
  refreshTokens = refreshTokens.filter(token => refresh_token !== token);

  response.send("Logout successful");
};

module.exports = {
  login,
  logout,
  generateNewAccessToken,
  isAdmin,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
