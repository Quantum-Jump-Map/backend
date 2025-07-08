let app = null;
serviceAccount = require("./service_key.json");

export function init_fcm()
{
    if(app!=null)
        return app;

    app = require("firebase-admin");
    app.initializeApp({
        credential: app.credential.cert(serviceAccount)
    });

    return app;
}