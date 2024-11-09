const express = require('express');
const {google} = require('googleapis');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');

const axios = require('axios');

const moduleManagerInstance = require('./core/moduleManager');

require('dotenv').config()

const {register: register_auth} = require('./auth/auth_general');
const {register: register_broadcast} = require('./broadcastRoom/room_general');

const app = express();
app.use(helmet());
app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}));

app.use(express.json());

app.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});

app.use(session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));



register_auth(app, moduleManagerInstance);

register_broadcast(app, moduleManagerInstance);