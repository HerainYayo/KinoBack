class authManager{
    access_token;
    constructor(){
        this.access_token = null;
    }

    setAccessToken(token){
        this.access_token = token;
    }

    getAccessToken(){
        return this.access_token;
    }
}

module.exports = authManager;