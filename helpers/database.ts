import {User} from "@firebase/auth";
import {collection, Firestore} from "@firebase/firestore";

export function getProjectsPath(user: User) {
    return `users/${user.uid!}/projects`
}

export function getUserProjectsCollection(db: Firestore, user: User) {
    return collection(db, getProjectsPath(user))
}

export const firebaseConfig = {
    apiKey: "AIzaSyBoSsmVIbFOFUxIT694874IJBRrLtKgG7I",
    authDomain: "pixel-painter-eb21f.firebaseapp.com",
    projectId: "pixel-painter-eb21f",
    storageBucket: "pixel-painter-eb21f.firebasestorage.app",
    messagingSenderId: "292877217298",
    appId: "1:292877217298:web:79fd9e6eccbb052ee872cb",
    measurementId: "G-P77XPN2ZJY"
};