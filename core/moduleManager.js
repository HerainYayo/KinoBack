const authManager = require('../manager/auth_manager');
const broadcastManager = require('../manager/broadcast_manager');
const userManager = require('../manager/user_manager');

class moduleManager {
    m_authManager;
    m_broadcastManager;
    m_userManager;
    constructor(){
        this.m_authManager = new authManager();
        this.m_broadcastManager = new broadcastManager();
        this.m_userManager = new userManager();
    }
}

const moduleManagerInstance = new moduleManager();

module.exports = moduleManagerInstance;