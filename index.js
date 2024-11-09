const express = require('express');
const {google} = require('googleapis');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config()

const axios = require('axios');

const moduleManagerInstance = require('./core/moduleManager');



const {register: register_auth} = require('./auth/auth_general');
const {register: register_broadcast} = require('./broadcastRoom/room_general');

const app = express();
app.use(helmet());
app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}));

app.use(express.json());

app.listen(process.env.PORT, () => {
    console.log('Server is running on http://localhost:'+ process.env.PORT);
});

app.use(session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.get('/', (req, res) => {
    res.send('Hello World!');
  });
  



register_auth(app, moduleManagerInstance);

register_broadcast(app, moduleManagerInstance);