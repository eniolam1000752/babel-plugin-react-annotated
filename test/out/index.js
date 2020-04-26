import React from "react";

const useestComponent = function () {
  const [{
    state1
  }, SET__state1] = React.useState({
    state1: {
      val: 3
    }
  }),
        [{
    state2
  }, SET__state2] = React.useState({
    state2: {}
  }),
        [{
    state3
  }, SET__state3] = React.useState({
    state3: []
  }),
        [{
    status
  }, SET__status] = React.useState({
    status: false
  });
  const [{
    var1
  }, SET__var1] = React.useState({
    var1: {}
  });
  const [{
    _value
  }, SET___value] = React.useState({
    _value: "string"
  });

  function initData() {
    console.log("data init");
  }

  const initialization = data => {
    SET__state3(_RN_17443054 => {
      _RN_17443054 = JSON.parse(JSON.stringify(_RN_17443054));
      _RN_17443054.state3[0].number = ++state2.value;
      return _RN_17443054;
    });
  };

  React.useEffect(() => {
    initialization(_state3, 89, 'eniola');
  }, []);
  React.useEffect(() => {
    SET__state1(_RN_17443054 => {
      _RN_17443054 = JSON.parse(JSON.stringify(_RN_17443054));
      _RN_17443054.state1 = {
        val: 90
      };
      return _RN_17443054;
    });
  }, []);
  return React.createElement(React.Fragment, null, React.createElement("div", null, React.createElement("div", null, state2), React.createElement("div", {
    onMouseDown: () => {}
  }, state3), React.createElement("div", {
    onClick: function () {
      let state1 = {
        val: 3
      };
      SET__state2(_RN_17443054 => {
        _RN_17443054 = JSON.parse(JSON.stringify(_RN_17443054));
        _RN_17443054.state2.age = _RN_17443054.state2.age + 10;
        return _RN_17443054;
      });
    }
  })));
};