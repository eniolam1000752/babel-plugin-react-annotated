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
    SET__state3(_RN_6618017 => {
      _RN_6618017 = JSON.parse(JSON.stringify(_RN_6618017));
      _RN_6618017.state3[0].number = ++state2.value;
      return _RN_6618017;
    });
  };

  React.useEffect(() => {
    initialization(_state3, 89, 'eniola');
  }, []);
  React.useEffect(() => {
    SET__state1(_RN_6618017 => {
      _RN_6618017 = JSON.parse(JSON.stringify(_RN_6618017));
      _RN_6618017.state1 = {
        val: 90
      };
      return _RN_6618017;
    });
  }, []);
  return React.createElement(React.Fragment, null, React.createElement("div", null, React.createElement("div", null, state2), React.createElement("div", {
    onMouseDown: () => {}
  }, state3), React.createElement("div", {
    onClick: function () {
      SET__state2(_RN_883031 => {
        _RN_883031 = JSON.parse(JSON.stringify(_RN_883031));
        _RN_883031.state2[0] = state3.val;
        SET__state1(_RN_7324045 => {
          _RN_7324045 = JSON.parse(JSON.stringify(_RN_7324045));
          _RN_7324045.state1 = _RN_883031.state2[0];
          return _RN_7324045;
        });
        return _RN_883031;
      });
    }
  })));
};