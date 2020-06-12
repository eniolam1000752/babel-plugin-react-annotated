import React from "react";
import * as firebase from "firebase/app";
import "firebase/auth";

class Auth {
  authProvider = null;

  constructor() {}

  login(email, password) {
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }

  fbLogin = () => {
    firebase.auth.FacebookAuthProvider();
    this.authProvider = 0;
  };

  googleLogin() {}

  register(email, password) {
    return firebase.auth().createUserWithEmailAndPassword(email, password);
  }

  isLoggedIn() {
    console.log(firebase.auth().currentUser);
  }

  logout() {
    return firebase.auth().signOut();
  }

  changePassword() {}

  addListener(listener) {
    if (listener === "AUTH_STATE_CHANGED") {
      return new Promise((resolve, reject) => {
        firebase.auth().onAuthStateChanged(resp => resolve(resp), err => reject(err));
      });
    }
  }

}

export { Auth };