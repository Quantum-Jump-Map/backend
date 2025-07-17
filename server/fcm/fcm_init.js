let app = null;
//serviceAccount = require("./service_key.json");
import serviceAccount from './service_key.json' with {type: "json"};
import test from 'firebase-admin';

export function init_fcm()
{
    if(app!=null)
        return app;

    app = test;
    app.initializeApp({
        credential: app.credential.cert(serviceAccount)
    });

    return app;
}