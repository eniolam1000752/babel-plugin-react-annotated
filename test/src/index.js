import React, { Fragment } from "react";

function TestComponent() {
  // @state
  let __state1 = { val: 3 },
    __state2 = {},
    __state3 = [],
    __status = false;

  let var1 = {};
  var _value = "string";

 
  function initData() {
    console.log("data init");
  }
  const initialization = () => {
    __state3[0].number = ++__state2.value;
  };
  
  //@init
  initialization(data, value, []);

  //@init
  useEffect(() => {
    effect;
    return () => {
      cleanup;
    };
  }, [input]);

  return (
    <React.Fragment>
      <div>
        <div>{__state2}</div>
        <div
          onMouseDown={() => {
            // __state1 = ++__state3.value[0];
            // ++__state1.val;
          }}
        >
          {__state3}
        </div>
        <div
          onClick={() => {
            // __testState = 3;
            // //@init
            // __testState.data = __state2[
            //   "eniola"
            // ] = __state1 = val1.data[0] = val2[0] = value.person.name[0] = val[0]++;
            //@init
            // __state3 = ++__state1.val; // /*  __state3.eni[0] = */ = __state3 = ++__state2.key;
            // __state1 = __state2;
            // __state3 = __state2.key;

            __state2 = __state3;
            // // @initiji
            // __state2 = ++__state1;
          }}
        >
          {/* {__status}, {__testState.data},{__state3[6]} */}
          {__state2 + " : " + __state3}
        </div>
      </div>
    </React.Fragment>
  );
}
