import React from "react";

// const useestComponent = function() {
//   // @state
//   let state1 = { val: 3 },
//     state2 = {},
//     state3 = [],
//     status = false;

//   //@state
//   let var1 = {};
//   //@state
//   var _value = "string";

//   function initData() {
//     console.log("data init");
//   }
//   //@init(_state3, 89,'eniola')
//   const initialization = (data) => {
//     state3[0].number = ++state2.value;
//   };

//   //@init
//   state1 = { val: 90 };

//   return (
//     <React.Fragment>
//       <div>
//         <div>{state2}</div>
//         <div
//           onMouseDown={() => {
//             // __state1 = ++__state3.value[0];
//             // ++__state1.val;
//           }}
//         >
//           {state3}
//         </div>
//         <div
//           onClick={function() {
//             let state1 = { val: 3 };
//             // __testState.data = __state2[
//             //   "eniola"
//             // ] = __state1 = val1.data[0] = val2[0] = value.person.name[0] = val[0]++;
//             // __state3 = ++__state1.val; // /*  __state3.eni[0] = */ = __state3 = ++__state2.key;
//             // __state1 = __state2;
//             // __state3 = __state2.key;
//             // state3 = ++state1;
//             // state2.value.val[0] = state1.val = state3.value.val.num[
//             //   "kjsd"
//             // ][0] = ++var1;

//             //@zone
//             {
//               state2.age = state2.age + 10;
//               ++state1.val;
//             }
//           }}
//         >
//           {/* {__status}, {__testState.data},{__state3[6]} */}
//           {/* {__state2 + " : " + __state3} */}
//         </div>
//       </div>
//     </React.Fragment>
//   );
// };

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
        firebase.auth().onAuthStateChanged(
          (resp) => resolve(resp),
          (err) => reject(err)
        );
      });
    }
  }
}

export { Auth };
