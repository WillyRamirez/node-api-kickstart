const express = require('express');
const db = require('./src/queries')
const auth = require('./src/authenticateJWT');
const port = 8080;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
});

app.post('/login', db.login)
app.post('/logout', db.logout)
app.post('/token', auth.isAuth, db.generateNewAccessToken)
app.get('/users', auth.isAuth, auth.isAdmin, db.getUsers)
app.get('/users/:id', auth.isAuth, db.getUserById)
app.post('/users', db.createUser)

app.put('/users/:id', auth.isAuth, db.updateUser)
app.delete('/users/:id', auth.isAuth, auth.isAdmin, db.deleteUser)

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
});
