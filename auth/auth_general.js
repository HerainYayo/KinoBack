const { google } = require("googleapis");

function register(app, moduleManagerInstance) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.CALLBACK_URL
  );

  app.get("/loginToGoogle", (req, res) => {
    const scopes = ["https://www.googleapis.com/auth/youtube"];
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
    });
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.redirect(url);
  });

  app.get("/oauth2callback", async (req, res) => {
    const { tokens } = await oauth2Client.getToken(req.query.code);
    oauth2Client.setCredentials(tokens);

    moduleManagerInstance.m_authManager.setAccessToken(
      oauth2Client.credentials.access_token
    );

    res.redirect(process.env.FRONTEND_DASHBOARD);
  });
}

exports.register = register;
