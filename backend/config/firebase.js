// import {cert, initializeApp} from "firebase-admin";
// import serviceAccount from "../serviceAccountKey.json" with {type: "json"}

// export const app = initializeApp({
//     credential: cert(serviceAccount)
// })



import { cert, initializeApp, getApps } from "firebase-admin/app";

const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT
);

export const app = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert(serviceAccount)
});
