"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// const transverse = require("@babel/traverse");
var types = require("@babel/types");

var template = require("@babel/template")["default"];

var stateAnnotation = /^\s*@state\s*$/;
var setStatePrefix = "SET";
var statePrefix = "__";
var DUMMY_NAME = "_RN_".concat(genVar());
var annotatedStateList = [];
var stateNames = [];
var visitors = {};

var _useStateTemplate = function _useStateTemplate(initValueNode, idText) {
  var leftExpression = types.arrayPattern([types.identifier(idText), types.identifier("".concat(setStatePrefix).concat(idText))]);
  var RightExpression = types.callExpression(types.memberExpression(types.identifier("React"), types.identifier("useState")), [initValueNode]);
  return types.variableDeclarator(leftExpression, RightExpression);
};

var _updateExpressionTemplate = function _updateExpressionTemplate(updateNode, trueVarName) {
  var buildASTNode = template("".concat(setStatePrefix).concat(trueVarName, "(STATE_NAME => {UPDATE_EXP; return STATE_NAME})"));
  return buildASTNode({
    UPDATE_EXP: updateNode,
    STATE_NAME: DUMMY_NAME
  });
};

var _updateExpressionTemplate2 = function _updateExpressionTemplate2(dummyVar, updateNode, nestNode, trueVar) {
  var isLeftMemberExp = types.isMemberExpression(trueVar); // const clonedLeft = types.cloneNode(updateNode);
  // const leftExpClone = types.cloneNode(trueVar);

  var buildASTNode = template("".concat(setStatePrefix).concat(trueVar.name || getMemberExpStateName(trueVar), "(STATE_NAME => {UPDATE_EXP;NEST_STATE_NODE ;return STATE_NAME})"));

  if (isLeftMemberExp) {
    replaceStateWithDummyInMemberExp(updateNode.left, dummyVar);
  } else {
    if (types.isIdentifier(updateNode.left)) {
      updateNode.left.name = dummyVar;
    }
  }

  return buildASTNode({
    UPDATE_EXP: updateNode,
    NEST_STATE_NODE: nestNode,
    STATE_NAME: dummyVar
  });
};

var _nestedUpdateExpTemplate = function _nestedUpdateExpTemplate(dummyVar, nestNode, higerStateName, trueVar, LONA) {
  var leftNodeOfNextAssignment = types.cloneNode(LONA);
  var isLeftMemberExp = types.isMemberExpression(trueVar);
  var isNextLeftMemberExp = types.isMemberExpression(leftNodeOfNextAssignment);
  var nextAssignLeft = leftNodeOfNextAssignment.name || getMemberExpStateName(leftNodeOfNextAssignment);
  var leftExpClone = types.cloneNode(trueVar);
  var buildASTNode = !isLeftMemberExp ? template("".concat(setStatePrefix).concat(trueVar.name, "(STATE_NAME => {STATE_NAME = HIGH_STATE_NAME; NEST_STATE_NODE ;return STATE_NAME})")) : template("".concat(setStatePrefix).concat(getMemberExpStateName(trueVar), "(STATE_NAME => {LEFT_EXP  = HIGH_STATE_NAME; NEST_STATE_NODE ;return STATE_NAME})"));

  if (isNextLeftMemberExp && stateNames.indexOf(nextAssignLeft) !== -1) {
    replaceStateWithDummyInMemberExp(leftNodeOfNextAssignment, higerStateName);
  } // console.log(
  //   "nest setstate builder: ",
  //   trueVar,
  //   leftNodeOfNextAssignment,
  //   nextAssignLeft
  // );


  var temp = !isNextLeftMemberExp ? higerStateName : leftNodeOfNextAssignment;
  var temp2 = stateNames.indexOf(nextAssignLeft) === -1 ? leftNodeOfNextAssignment : temp;
  var out = {
    HIGH_STATE_NAME: temp2,
    NEST_STATE_NODE: nestNode,
    STATE_NAME: dummyVar
  };
  if (isLeftMemberExp) replaceStateWithDummyInMemberExp(leftExpClone, dummyVar);
  return buildASTNode(!isLeftMemberExp ? out : _objectSpread({}, out, {
    LEFT_EXP: leftExpClone
  }));
};

var assignmentTemplate = function assignmentTemplate(leftNode, rightNode, LONA, node) {
  // const isLeftMemberExp = types.isMemberExpression(leftNode);
  var leftNodeOfNextAssignment = LONA ? types.cloneNode(LONA) : null;
  var isNextLeftMemberExp = LONA ? types.isMemberExpression(leftNodeOfNextAssignment) : null;
  var buildAstNode = template("VAR_NAME = RIGHT_NODE");
  var varInExp = LONA ? leftNodeOfNextAssignment.name || getMemberExpStateName(leftNodeOfNextAssignment) : null; // console.log(
  //   "test oooo: ",
  //   isNextLeftMemberExp && stateNames.indexOf(varInExp) !== -1,
  //   varInExp
  // );

  if (LONA) {
    if (LONA && isNextLeftMemberExp && stateNames.indexOf(varInExp) !== -1) {
      replaceStateWithDummyInMemberExp(leftNodeOfNextAssignment, rightNode);
    } else {
      rightNode = stateNames.indexOf(varInExp) === -1 ? leftNodeOfNextAssignment.name : rightNode;
    }
  }

  var out = {
    VAR_NAME: leftNode,
    RIGHT_NODE: LONA ? !isNextLeftMemberExp ? rightNode : leftNodeOfNextAssignment : rightNode
  };

  if (node && node.operator !== "=") {
    return types.assignmentExpression(node.operator, leftNode, types.identifier(out.RIGHT_NODE));
  } else {
    return buildAstNode(out);
  }
};

var getMemberExpStateName = function getMemberExpStateName(memberExp) {
  var out = null;

  var func = function func(exp) {
    if (types.isMemberExpression(exp.object)) {
      func(exp.object);
    } else {
      out = exp.object.name;
    }
  };

  func(memberExp);
  return out;
};

var _stateWithReturnTemplate = function _stateWithReturnTemplate(equivNodeRight, name) {
  var setStateNode = template("".concat(setStatePrefix).concat(name, "( _var_1234 => (temp = NODE_EQUIV) )"));
  var declare1 = types.variableDeclaration("let", [types.variableDeclarator(types.identifier("temp"), null)]);
  var declare2 = setStateNode({
    NODE_EQUIV: equivNodeRight
  });
  var declare3 = types.returnStatement(types.identifier("temp"));
  var block = types.blockStatement([declare1, declare2, declare3]);
  var arrowFunc = types.arrowFunctionExpression([], block);
  return types.callExpression(arrowFunc, []);
};

var isNodeReactState = function isNodeReactState(node) {
  return stateNames.indexOf(node.name || getMemberExpStateName(node)) !== -1;
};

var transformer = function transformer(node, type) {
  switch (type) {
    case "toUseState":
      return _useStateTemplate(node.init, node.id.name);

    default:
      return null;
  }
};

var check__PrefixSyntax = function check__PrefixSyntax(node) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = node.declarations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var item = _step.value;
      var varName = item.id.name;

      if (new RegExp("^".concat(statePrefix, "\\w+$")).test(varName)) {
        throw new SyntaxError("Error in build: non anotated variable should not have '".concat(statePrefix, "' prefix for variable: '").concat(varName, "'"));
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
};

var checkAnnotatedSyntax = function checkAnnotatedSyntax(node) {
  var declarations = types.cloneNode(node).declarations;
  node.declarations = [];
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = declarations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var item = _step2.value;
      var varName = item.id.name;

      if (!new RegExp("^".concat(statePrefix, "\\w+$")).test(varName)) {
        throw new SyntaxError("Error in build: anotated variable should have prefix '".concat(statePrefix, "' for variable: '").concat(varName, "'. try adding '").concat(statePrefix, "' or remove annoation "));
      } else {
        stateCollector(item);
        trasfromDeclearationsToUseState(node, item);
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
        _iterator2["return"]();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }
};

function genVar() {
  var randVar = "".concat(Math.random());
  return randVar.slice(2, randVar.length - 9);
} // const exceptionMsg = function(type, data, errType = null) {};


var addVisitor = function addVisitor(visitor) {
  Object.assign(visitors, visitor);
};

var isParentReactElement = function isParentReactElement(nodePath) {
  var parentNode = nodePath.parentPath.parent;

  if (types.isFunctionDeclaration(parentNode) || types.isArrowFunctionExpression(parentNode)) {
    if (types.isFunctionDeclaration(parentNode)) {
      var funcFirstLetter = (parentNode.id.name || "r")[0]; // r is just a dummy variable that results to false

      return funcFirstLetter.toUpperCase() === funcFirstLetter || /^use/.test(parentNode.id.name) ? true : false;
    }

    if (types.isArrowFunctionExpression(parentNode)) {
      parentNode = nodePath.parentPath.parentPath.parent;
      var _funcFirstLetter = (parentNode.id.name || "r")[0];
      return _funcFirstLetter.toUpperCase() === _funcFirstLetter || /^use/.test(parentNode.id.name) ? true : false;
    }
  } else {
    return false;
  }

  return false;
};

var declarationVisitor = {
  VariableDeclaration: function VariableDeclaration(path) {
    var node = path.node;
    var immidateTopComment = node.leadingComments ? node.leadingComments[node.leadingComments.length - 1] : null;

    if (!immidateTopComment) {
      check__PrefixSyntax(node);
      return 0;
    }

    if (node.leadingComments.length === 0) {
      check__PrefixSyntax(node);
      return 0;
    }

    if (!stateAnnotation.test(immidateTopComment.value)) {
      check__PrefixSyntax(node);
      return 0;
    }

    if (!isParentReactElement(path)) {
      throw new SyntaxError("Error in build: state should be defined within a react element either a class or function");
    } else {
      checkAnnotatedSyntax(node);
      cleanUpAnnotations(node);
    }
  }
};
var expressionVisistor = {
  AssignmentExpression: function AssignmentExpression(path) {
    var node = path.node;
    this.varName = stateNames.indexOf(node.left.name) !== -1 ? node.left.name : null; // checks and performs transform on single assginments

    if (this.varName && !types.isAssignmentExpression(node.right)) {
      // console.log("found a state assignment: ", path);
      path.traverse({
        Identifier: function Identifier(path) {
          if (path.node.name === this.varName) {
            path.replaceWith(types.identifier(DUMMY_NAME));
          }
        }
      }, {
        varName: this.varName
      });
      path.replaceWith(_updateExpressionTemplate(node, this.varName));
    } // checks and perform transform on nested assignment


    if (types.isAssignmentExpression(node.right) && !types.isAssignmentExpression(path.parent)) {
      // console.log("found a nested assignment ooo: ", path);
      var resultAssignNode = null;
      var higherState = null;

      var reculsive = function reculsive(assignNode) {
        if (types.isAssignmentExpression(assignNode.right) && stateNames.indexOf(assignNode.left.name || getMemberExpStateName(assignNode.left)) !== -1 ? true : assignNode.right.operator === "=") {
          resultAssignNode = stateNames.indexOf(assignNode.left.name || getMemberExpStateName(assignNode.left)) !== -1 ? _nestedUpdateExpTemplate(higherState || "_RN_".concat(genVar()), resultAssignNode, higherState = "_RN_".concat(genVar()), assignNode.left, assignNode.right.left) : !resultAssignNode ? assignmentTemplate(assignNode.left, higherState = "_RN_".concat(genVar()), assignNode.right.left) : !resultAssignNode.length ? [assignmentTemplate(assignNode.left, higherState, assignNode.right.left), resultAssignNode] : [assignmentTemplate(assignNode.left, higherState, assignNode.right.left)].concat(_toConsumableArray(resultAssignNode)); // console.log("result exp: ", types.cloneNode(resultAssignNode));

          reculsive(assignNode.right);
        } else {
          if (resultAssignNode) {
            var higherStateNode = types.cloneNode(assignNode.left);
            var leftNode = types.cloneNode(assignNode.left);
            var varInExp = leftNode.name || getMemberExpStateName(leftNode);
            higherStateNode = types.identifier(higherState); // assignNode.left = types.identifier(higherState);
            // console.log("result2: ", resultAssignNode);

            resultAssignNode = stateNames.indexOf(varInExp) !== -1 ? _updateExpressionTemplate2(higherState, assignNode, resultAssignNode, leftNode) : !resultAssignNode.length ? [assignmentTemplate(higherStateNode, assignNode.right), assignmentTemplate(leftNode, higherState, null, assignNode), resultAssignNode] : [assignmentTemplate(higherStateNode, assignNode.right), assignmentTemplate(leftNode, higherState, null, assignNode)].concat(_toConsumableArray(resultAssignNode));
          }
        }
      };

      reculsive(node);

      if (resultAssignNode) {
        if (!resultAssignNode.length) {
          path.replaceWith(resultAssignNode);
        } else {
          path.replaceWithMultiple(resultAssignNode);
        }
      }
    } // checks and perform transfroms on assignments whose right is an object with a property to update eg (object.propery = 3)


    if (types.isMemberExpression(node.left) && !types.isAssignmentExpression(path.parent) && !types.isAssignmentExpression(node.right)) {
      this.varName = stateNames.indexOf(getMemberExpStateName(node.left)) !== -1 ? getMemberExpStateName(node.left) : null; // console.log("found an object assignment: ", this.varName);

      path.traverse({
        Identifier: function Identifier(path) {
          if (path.node.name === this.varName) {
            path.replaceWith(types.identifier(DUMMY_NAME));
            this.assignmentPath.replaceWith(_updateExpressionTemplate(this.assignmentPath.node, this.varName));
          }
        }
      }, {
        varName: this.varName,
        assignmentPath: path
      });
    }
  },
  // checks and transfroms update expressions like (++i & i--)
  UpdateExpression: function UpdateExpression(path) {
    var node = path.node;
    this.varName = stateNames.indexOf(node.argument.name) !== -1 ? node.argument.name : null;

    if (this.varName && !types.isAssignmentExpression(path.parent)) {
      // console.log("found an update expression: ", path);
      path.traverse({
        Identifier: function Identifier(path) {
          if (path.node.name === this.varName) {
            path.replaceWith(types.identifier(DUMMY_NAME));
          }
        }
      }, {
        varName: this.varName
      });
      path.replaceWith(_updateExpressionTemplate(node, this.varName));
    }
  }
};

var stateCollector = function stateCollector(declearNode) {
  var varName = declearNode.id.name;
  annotatedStateList.push(declearNode);
  stateNames.push(varName);
};

var trasfromDeclearationsToUseState = function trasfromDeclearationsToUseState(node, declearNode) {
  node.declarations.push(transformer(declearNode, "toUseState"));
  "";
};

var replaceStateWithDummyInMemberExp = function replaceStateWithDummyInMemberExp(memberExp, dummyVar) {
  var func = function func(exp) {
    if (types.isMemberExpression(exp.object)) {
      func(exp.object);
    } else {
      exp.object.name = dummyVar;
    }
  };

  func(memberExp);
};

var cleanUpAnnotations = function cleanUpAnnotations(node) {
  node.leadingComments = node.leadingComments ? node.leadingComments.filter(function (item) {
    return !item.value.match(/^@\w+$/) ? item : null;
  }) : null;
  node.trailingComments = node.trailingComments ? node.trailingComments.filter(function (item) {
    return !item.value.match(/^@\w+$/) ? item : null;
  }) : null;
};

addVisitor({
  AssignmentExpression: function AssignmentExpression(path, state) {// console.log(state);
  }
});
addVisitor(declarationVisitor);
addVisitor(expressionVisistor);

function astTransfromFunction() {
  return {
    pre: function pre() {},
    visitor: visitors,
    post: function post(val) {// console.log("after transverse:", val);
    }
  };
}

module.exports = astTransfromFunction;