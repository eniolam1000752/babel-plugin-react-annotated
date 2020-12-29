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
var setStatePrefix = "SET__";
var statePrefix = "__";
var DUMMY_NAME = "_RN_".concat(genVar());
var initTag = "@ -% init %-";
var annotatedStateList = [];
var stateNames = [];
var visitors = {};
var expTracker = [];
var useEffectNode = null;

var _useStateTemplate = function _useStateTemplate(initValueNode, idText) {
  // const leftExpression = types.arrayPattern([
  //   types.identifier(idText),
  types.identifier("".concat(setStatePrefix).concat(idText)); // ]);

  var objectConstruct = types.objectExpression([types.objectProperty(types.identifier(idText), initValueNode)]);
  var leftExpression = types.arrayPattern([types.objectPattern([types.objectProperty(types.identifier(idText), types.identifier(idText), false, true)]), types.identifier("".concat(setStatePrefix).concat(idText))]);
  var RightExpression = types.callExpression(types.memberExpression(types.identifier("React"), types.identifier("useState")), [objectConstruct
  /* initValueNode */
  ]);
  return types.variableDeclarator(leftExpression, RightExpression);
};

var _updateExpressionTemplate = function _updateExpressionTemplate(updateNode, trueVarName) {
  var buildASTNode = template("".concat(setStatePrefix).concat(trueVarName, "(STATE_NAME => {UPDATE_EXP; return STATE_NAME})"));
  updateNode = types.expressionStatement(updateNode);
  return buildASTNode({
    UPDATE_EXP: [clonedStateExp(), updateNode],
    STATE_NAME: DUMMY_NAME
  });
};

var clonedStateExp = function clonedStateExp(varName) {
  return types.expressionStatement(types.assignmentExpression("=", types.identifier(varName || DUMMY_NAME), types.callExpression(types.memberExpression(types.identifier("JSON"), types.identifier("parse")), [types.callExpression(types.memberExpression(types.identifier("JSON"), types.identifier("stringify")), [types.identifier(varName || DUMMY_NAME)])])));
};

var _updateExpressionTemplate2 = function _updateExpressionTemplate2(dummyVar, updateNode, nestNode, trueVar) {
  var isLeftMemberExp = types.isMemberExpression(trueVar); // const clonedLeft = types.cloneNode(updateNode);
  // const leftExpClone = types.cloneNode(trueVar);

  var buildASTNode = template("".concat(setStatePrefix).concat(trueVar.name || getMemberExpStateName(trueVar), "(STATE_NAME => {UPDATE_EXP;NEST_STATE_NODE ;return STATE_NAME})")); // if (isLeftMemberExp) {
  //   replaceStateWithDummyInMemberExp(updateNode.left, dummyVar);
  // } else {
  //   if (types.isIdentifier(updateNode.left)) {
  //     updateNode.left.name = dummyVar;
  //   }
  // }

  if (isLeftMemberExp) {
    replaceStateWithDummyInMemberExp(updateNode.left, dummyVar, memberExpNode(getMemberExpStateName(trueVar), dummyVar));
  } else {
    if (types.isIdentifier(updateNode.left)) {
      updateNode.left = memberExpNode(trueVar.name, dummyVar);
      /* types.identifier(dummyVar); */
    }
  }

  updateNode = types.expressionStatement(updateNode);
  return buildASTNode({
    UPDATE_EXP: [clonedStateExp(dummyVar), updateNode],
    NEST_STATE_NODE: nestNode,
    STATE_NAME: dummyVar
  });
};

var _nestedUpdateExpTemplate = function _nestedUpdateExpTemplate(dummyVar, nestNode, higerStateName, trueVar, LONA, path) {
  var leftNodeOfNextAssignment = types.cloneNode(LONA);
  var isLeftMemberExp = types.isMemberExpression(trueVar);
  var isNextLeftMemberExp = types.isMemberExpression(leftNodeOfNextAssignment);
  var nextAssignLeft = leftNodeOfNextAssignment.name || getMemberExpStateName(leftNodeOfNextAssignment);
  var leftExpClone = types.cloneNode(trueVar);
  var buildASTNode = !isLeftMemberExp ? template("".concat(setStatePrefix).concat(trueVar.name, "(STATE_NAME => {STATE_CLONE; MEMBER_STATE_NAME = HIGH_STATE_NAME; NEST_STATE_NODE ;return STATE_NAME})")) : template("".concat(setStatePrefix).concat(getMemberExpStateName(trueVar), "(STATE_NAME => {STATE_CLONE;LEFT_EXP  = HIGH_STATE_NAME; NEST_STATE_NODE ;return STATE_NAME})"));

  if (isNextLeftMemberExp && isIdentifierReactState(path, nextAssignLeft)
  /* stateNames.indexOf(nextAssignLeft) !== -1 */
  ) {
      replaceStateWithDummyInMemberExp(leftNodeOfNextAssignment, higerStateName, memberExpNode(nextAssignLeft, higerStateName));
    }

  if (!isNextLeftMemberExp && isIdentifierReactState(path, nextAssignLeft)
  /* stateNames.indexOf(nextAssignLeft) !== -1 */
  ) {
      higerStateName = memberExpNode(nextAssignLeft, higerStateName);
    } // console.log(
  //   "nest setstate builder: ",
  //   trueVar,
  //   leftNodeOfNextAssignment,
  //   nextAssignLeft
  // );


  var temp = !isNextLeftMemberExp ? higerStateName : leftNodeOfNextAssignment;
  var temp2 =
  /* stateNames.indexOf(nextAssignLeft) === -1 */
  !isIdentifierReactState(path, nextAssignLeft) ? leftNodeOfNextAssignment : temp;
  var out = {
    HIGH_STATE_NAME: temp2,
    NEST_STATE_NODE: nestNode,
    STATE_NAME: dummyVar,
    STATE_CLONE: clonedStateExp(dummyVar)
  };

  if (isLeftMemberExp) {
    // replaceStateWithDummyInMemberExp(leftExpClone, dummyVar);
    replaceStateWithDummyInMemberExp(leftExpClone, dummyVar, memberExpNode(getMemberExpStateName(trueVar), dummyVar));
  }

  return buildASTNode(!isLeftMemberExp ? _objectSpread({}, out, {
    MEMBER_STATE_NAME: memberExpNode(trueVar.name || getMemberExpStateName(trueVar), dummyVar)
  }) : _objectSpread({}, out, {
    LEFT_EXP: leftExpClone
  }));
};

var assignmentTemplate = function assignmentTemplate(leftNode, rightNode, LONA, node, path) {
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
    if (LONA && isNextLeftMemberExp && isIdentifierReactState(path, varInExp)
    /* stateNames.indexOf(varInExp) !== -1 */
    ) {
        // console.log("found a next assingment => ");
        replaceStateWithDummyInMemberExp(leftNodeOfNextAssignment, rightNode, memberExpNode(getMemberExpStateName(leftNodeOfNextAssignment), rightNode));
      } else {
      rightNode =
      /* !isNodeReactState(varInExp) */
      !isIdentifierReactState(path, varInExp) ? leftNodeOfNextAssignment.name : memberExpNode(leftNodeOfNextAssignment.name, rightNode);
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

var _stateWithReturnTemplate = function _stateWithReturnTemplate(equivNodeRight, name, nameExp) {
  // console.log("for name: ", name, " : ", nameExp);
  var setStateNode = template("".concat(setStatePrefix).concat(name, "( ARGS => { NODE_EQUIV; return ARGS;  })"));
  var declare1 = types.variableDeclaration("let", [types.variableDeclarator(types.identifier(DUMMY_NAME), nameExp.argument)]);
  var tempNode = types.cloneNode(equivNodeRight);
  tempNode.argument = types.identifier(DUMMY_NAME);
  var declare2 = setStateNode({
    NODE_EQUIV: [clonedStateExp(), types.expressionStatement(equivNodeRight)],
    ARGS: DUMMY_NAME
  });
  var declare3 = types.returnStatement(tempNode);
  var block = types.blockStatement([declare1, declare2, declare3]);
  var arrowFunc = types.arrowFunctionExpression([], block);
  return types.callExpression(arrowFunc, []);
};

var transformer = function transformer(node, type) {
  switch (type) {
    case "toUseState":
      return _useStateTemplate(node.init, node.id.name);

    default:
      return null;
  }
};

var check__PrefixSyntax = function check__PrefixSyntax(node, path) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = node.declarations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var item = _step.value;
      var varName = item.id.name;

      if (new RegExp("^".concat(statePrefix, "\\w+$")).test(varName)) {
        throw path.buildCodeFrameError("Error in build: non anotated variable should not have '".concat(statePrefix, "' prefix for variable: '").concat(varName, "'"));
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

var checkAnnotatedSyntax = function checkAnnotatedSyntax(node, path) {
  var declarations = types.cloneNode(node).declarations;
  node.declarations = [];
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = declarations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var item = _step2.value;
      var varName = item.id.name; // if (!new RegExp(`^${statePrefix}\\w+$`).test(varName)) {
      //   throw path.buildCodeFrameError(
      //     `Error in build: anotated variable should have prefix '${statePrefix}' for variable: '${varName}'. try adding '${statePrefix}' or remove annoation `
      //   );
      // } else {

      stateCollector(item);
      trasfromDeclearationsToUseState(node, item); // }
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

function isIdentifierReactState(path, varName) {
  var scope = path ? path.scope : null;
  var bindings = scope ? scope.bindings : null;

  if (bindings) {
    console.log("Bindings: ", Object.keys(bindings), !!bindings[varName]);
  }

  if (!isNodeReactState(varName)) return 0; // console.log(varName);

  if (scope && bindings[varName]) {
    var parentNode = scope.path.parent;
    var isReactComponentBlock = false;

    if ((types.isArrowFunctionExpression(scope.block) || types.isFunctionExpression(scope.block)) && types.isVariableDeclarator(parentNode) && types.isIdentifier(parentNode.id)) {
      isReactComponentBlock = /^use/.test(parentNode.id.name) || /^_?[A-Z]/.test(parentNode.id.name);
    } else if (types.isFunctionDeclaration(scope.block) && types.isIdentifier(scope.block.id)) {
      isReactComponentBlock = /^use/.test(scope.block.id.name) || /^_?[A-Z]/.test(scope.block.id.name);
    } // console.log(
    //   "checking if valid react state: ",
    //   isNodeReactState(varName) && isReactComponentBlock
    // );


    return isNodeReactState(varName) && isReactComponentBlock;
  }

  if (scope) {
    return isIdentifierReactState(scope.path.parentPath, varName);
  }

  return false;
}

var declarationVisitor = {
  VariableDeclaration: function VariableDeclaration(path) {
    var node = path.node;
    var immidateTopComment = node.leadingComments ? node.leadingComments[node.leadingComments.length - 1] : null;

    if (!immidateTopComment) {
      // check__PrefixSyntax(node, path);
      return 0;
    }

    if (node.leadingComments.length === 0) {
      // check__PrefixSyntax(node, path);
      return 0;
    }

    if (!stateAnnotation.test(immidateTopComment.value)) {
      initExpression(_objectSpread({}, path), path, "DECLARE"); // check__PrefixSyntax(node, path);

      return 0;
    }

    if (!isParentReactElement(path)) {
      throw path.buildCodeFrameError("Error in build: state should be defined within a functional react element");
    } else {
      checkAnnotatedSyntax(node, path);
      cleanUpAnnotations(node);
    }
  }
};
var expressionVisistor = {
  AssignmentExpression: function AssignmentExpression(path) {
    var clonePath = _objectSpread({}, path);

    var node = path.node;
    this.varName = stateNames.indexOf(node.left.name || getMemberExpStateName(node.left)) !== -1 ? node.left.name || getMemberExpStateName(node.left) : null; // this.varName
    //   ? console.log(
    //       "testing react state validity: ",
    //       isIdentifierReactState(path, this.varName)
    //     )
    //   : null;
    // checks and performs transform on single assginments

    if (this.varName && !types.isAssignmentExpression(node.right) && isIdentifierReactState(path, this.varName)) {
      path.traverse({
        Identifier: function Identifier(path) {
          if (path.node.name === this.varName) {
            path._replaceWith(memberExpNode(this.varName)
            /* types.identifier(DUMMY_NAME) */
            );
          }
        }
      }, {
        varName: this.varName
      });

      if (types.isUpdateExpression(node.right) && isIdentifierReactState(path, node.right.argument) // isNodeReactState(node.right.argument)
      ) {
          var dumVar = DUMMY_NAME;
          var nodeClone = types.cloneNode(node.right);
          var args = nodeClone.argument;
          var name = args.name || getMemberExpStateName(args);

          if (types.isMemberExpression(node.right.argument)) {
            replaceStateWithDummyInMemberExp(node.right.argument, dumVar, memberExpNode(name, dumVar));
          } else if (types.isIdentifier(node.right.argument)) {
            node.right.argument = memberExpNode(name, dumVar);
          }

          node.right = _stateWithReturnTemplate(types.cloneNode(node.right), name, nodeClone);
        }

      path.replaceWith(_updateExpressionTemplate(node, this.varName));
    } // checks and perform transform on nested assignment


    if (types.isAssignmentExpression(node.right) && !types.isAssignmentExpression(path.parent)) {
      // console.log("found a nested assignment ooo: ", path);
      var resultAssignNode = null;
      var higherState = null;

      var reculsive = function reculsive(assignNode) {
        if (types.isAssignmentExpression(assignNode.right) && // stateNames.indexOf(
        isIdentifierReactState(path, assignNode.left.name || getMemberExpStateName(assignNode.left)) ? // ) !== -1
        true : assignNode.right.operator === "=") {
          resultAssignNode = // stateNames.indexOf(
          //   assignNode.left.name || getMemberExpStateName(assignNode.left)
          // ) !== -1
          isIdentifierReactState(path, assignNode.left.name || getMemberExpStateName(assignNode.left)) ? _nestedUpdateExpTemplate(higherState || "_RN_".concat(genVar()), resultAssignNode, higherState = "_RN_".concat(genVar()), assignNode.left, assignNode.right.left, path) : !resultAssignNode ? assignmentTemplate(assignNode.left, higherState = "_RN_".concat(genVar()), assignNode.right.left, null, path) : !resultAssignNode.length ? [assignmentTemplate(assignNode.left, higherState, assignNode.right.left, null, path), resultAssignNode] : [assignmentTemplate(assignNode.left, higherState, assignNode.right.left, null, path)].concat(_toConsumableArray(resultAssignNode)); // console.log("result exp: ", types.cloneNode(resultAssignNode));

          reculsive(assignNode.right);
        } else {
          if (resultAssignNode) {
            var higherStateNode = types.cloneNode(assignNode.left);
            var leftNode = types.cloneNode(assignNode.left);
            var varInExp = leftNode.name || getMemberExpStateName(leftNode);
            higherStateNode = types.identifier(higherState);
            console.log(assignNode.right.argument);

            if (types.isUpdateExpression(assignNode.right) && isIdentifierReactState(path, assignNode.right.argument.name || getMemberExpStateName(assignNode.right.argument))) {
              var _nodeClone = types.cloneNode(assignNode.right);

              var _args = _nodeClone.argument;

              var _name = _args.name || getMemberExpStateName(_args);

              if (types.isMemberExpression(assignNode.right.argument)) {
                replaceStateWithDummyInMemberExp(assignNode.right.argument, DUMMY_NAME, memberExpNode(_name, DUMMY_NAME));
              } else if (types.isIdentifier(assignNode.right.argument)) {
                assignNode.right.argument.name = DUMMY_NAME;
              }

              assignNode.right = _stateWithReturnTemplate(types.cloneNode(assignNode.right), _name, _nodeClone);
            }

            resultAssignNode = isIdentifierReactState(path, varInExp)
            /* stateNames.indexOf(varInExp) !== -1 */
            ? _updateExpressionTemplate2(higherState, assignNode, resultAssignNode, leftNode) : !resultAssignNode.length ? [assignmentTemplate(higherStateNode, assignNode.right, null, null, path), assignmentTemplate(leftNode, higherState, null, assignNode, path), resultAssignNode] : [assignmentTemplate(higherStateNode, assignNode.right, null, null, path), assignmentTemplate(leftNode, higherState, null, assignNode, path)].concat(_toConsumableArray(resultAssignNode));
          }
        }
      };

      reculsive(node);

      if (resultAssignNode) {
        if (!resultAssignNode.length) {
          path.replaceWith(resultAssignNode);
        } else {
          path.replaceWith(types.blockStatement(resultAssignNode));
        }
      }
    } // checks and perform transfroms on assignments whose left is an object with a property to update eg (object.propery = 3)


    if (types.isMemberExpression(node.left) && !types.isAssignmentExpression(path.parent) && !types.isAssignmentExpression(node.right)) {
      this.varName = isIdentifierReactState(path, getMemberExpStateName(node.left))
      /* stateNames.indexOf(getMemberExpStateName(node.left)) !== -1 */
      ? getMemberExpStateName(node.left) : null; // console.log("found an object assignment: ", this.varName);

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

    initExpression(clonePath, path); // initExpression(path);
  },
  // checks and transfroms update expressions like (++i & i--)
  UpdateExpression: function UpdateExpression(path) {
    var node = path.node;
    var nodeClone = types.cloneNode(node);
    var args = node.argument; // console.log("name: ", "");

    this.varName = isIdentifierReactState(path, args.name || getMemberExpStateName(args))
    /* isNodeReactState(args) */
    ? args.name || getMemberExpStateName(args) : null;

    if (this.varName && !types.isAssignmentExpression(path.parent)) {
      // console.log("found an update expression: ", this.varName);
      if (types.isMemberExpression(args)) {
        replaceStateWithDummyInMemberExp(args, null, memberExpNode(this.varName, DUMMY_NAME));
      } else if (types.isIdentifier(args)) {
        node.argument = memberExpNode(this.varName, DUMMY_NAME);
      }

      path.replaceWith(_stateWithReturnTemplate(node, this.varName, nodeClone)
      /* _updateExpressionTemplate(node, this.varName) */
      );
    }
  },
  FunctionDeclaration: function FunctionDeclaration(path) {
    // console.log(path.node);
    initExpression(_objectSpread({}, path), path, "DECLARE");
  },
  CallExpression: function CallExpression(path) {
    var callee = path.node.callee;

    if (!(types.isIdentifier(callee) && /^use/.test(callee.name))) {
      initExpression(_objectSpread({}, path), path);
    }
  },
  BlockStatement: function BlockStatement(path) {
    var node = path.node;
    var immidateTopComment = node.leadingComments ? node.leadingComments[node.leadingComments.length - 1] : null;

    if (immidateTopComment && /^@zone\s*$/.test(immidateTopComment.value)) {
      path.replaceWith(types.expressionStatement(types.callExpression(types.arrowFunctionExpression([], node, true), [])));
    }

    console.log("comments: ", immidateTopComment);
  }
};

function initAnnotationParser(annotation) {
  var params = annotation.match(/(?<=(\()).*(?=(\)))/g)[0].split(",");
  params = params.length === 1 && params[0] === "" ? [] : params;
  params = params.filter(function (item, index) {
    return types.isExpressionStatement(template(item)());
  }).map(function (item) {
    return template(item)().expression;
  }); // console.log("PARAMETERS TO BE PARSED: ", params);

  return params;
}

function initExpression(path, transformedPath, typeExp) {
  var expStatement = typeExp === "DECLARE" ? path.node : path.parent;
  var immidateTopComment = expStatement.leadingComments ? expStatement.leadingComments[expStatement.leadingComments.length - 1] : null;

  if (immidateTopComment && /\s*@init\s*(\(.*\))?\s*$/.test(immidateTopComment.value) && immidateTopComment.type === "CommentLine") {
    var componentBlock = getParentComponentOrUseFuncBlock(path);
    var childToPut = types.cloneNode(transformedPath.node); // console.log(path.parent);
    // console.log(transformedPath.node);
    // if (typeExp === "DECLARE") {

    if (typeExp === "DECLARE" && types.isFunctionDeclaration(path.node)) {
      childToPut = types.callExpression(types.identifier(path.node.id.name), initAnnotationParser(immidateTopComment.value));
    }

    if (typeExp === "DECLARE" && types.isVariableDeclaration(path.node) && (types.isArrowFunctionExpression(path.node.declarations[0].init) || types.isFunctionExpression(path.node.declarations[0].init))) {
      // console.log("variable declarator", path.node);
      // if (
      //   types.isArrowFunctionExpression(path.node.declarations[0].init) ||
      //   types.isFunctionExpression(path.node.declarations[0].init)
      // ) {
      childToPut = types.callExpression(types.identifier(path.node.declarations[0].id.name), initAnnotationParser(immidateTopComment.value)); // }
    } // }


    putNodeInUseEffect(componentBlock, childToPut);
    if (typeExp !== "DECLARE") transformedPath.remove();
  }
}

function putNodeInUseEffect(parentBlockExp, childNode) {
  // if (!useEffectNode) {
  console.log(" *********** putting data into use effect node *********** ");
  var node = template("\n      React.useEffect(()=>{ INIT_NODES; }, [])\n      ")({
    INIT_NODES: childNode
  });
  parentBlockExp.body = parentBlockExp.body.reduce(function (cum, item) {
    return types.isReturnStatement(item) ? [].concat(_toConsumableArray(cum), [node, item]) : [].concat(_toConsumableArray(cum), [item]);
  }, []);
  useEffectNode = node; // } else {
  //   useEffectNode.expression.arguments[0].body.body.push(childNode);
  // }
}

var getParentComponentOrUseFuncBlock = function getParentComponentOrUseFuncBlock(path) {
  var out = null;

  var reculsive = function reculsive(parentPath) {
    var parentNode = {};

    if (types.isArrowFunctionExpression(parentPath.parent) || types.isFunctionExpression(parentPath.parent)) {
      parentNode = parentPath.parentPath.parentPath.parent.declarations ? parentPath.parentPath.parentPath.parent.declarations[0] : null;
    } else if (types.isFunctionDeclaration(parentPath.parent)) {
      parentNode = parentPath.parent;
    }

    if (parentNode && parentNode.id && (/[A-Z]/.test(parentNode.id.name[0]) || /^use/.test(parentNode.id.name)) && !/useEffect/.test(parentNode.id.name)) {
      // console.log("found parent which is : ", parentNode);
      if (types.isFunctionDeclaration(parentNode)) {
        out = parentNode.body;
      } else {
        out = parentNode.init.body;
      }
    } else {
      if (parentPath.parentPath) reculsive(parentPath.parentPath);
    }
  };

  reculsive(path.parentPath);
  return out;
};

var stateCollector = function stateCollector(declearNode) {
  var varName = declearNode.id.name;
  annotatedStateList.push(declearNode);
  stateNames.push(varName);
};

var trasfromDeclearationsToUseState = function trasfromDeclearationsToUseState(node, declearNode) {
  node.kind = "const";
  node.declarations.push(transformer(declearNode, "toUseState"));
  "";
};

var replaceStateWithDummyInMemberExp = function replaceStateWithDummyInMemberExp(memberExp, dummyVar, overrideVarNode) {
  var func = function func(exp) {
    if (types.isMemberExpression(exp.object)) {
      func(exp.object);
    } else {
      exp.object = overrideVarNode || types.identifier(dummyVar);
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

var isNodeReactState = function isNodeReactState(node) {
  if (node) {
    return typeof node === "string" ? stateNames.indexOf(node) !== -1 : stateNames.indexOf(node.name || getMemberExpStateName(node)) !== -1;
  } else {
    return false;
  }
};

var memberExpNode = function memberExpNode(stateName, varName) {
  return types.memberExpression(types.identifier(varName || DUMMY_NAME), types.identifier(stateName));
};

function genVar() {
  var randVar = "".concat(Math.random());
  return randVar.slice(2, randVar.length - 9);
}

var addVisitor = function addVisitor(visitor) {
  Object.assign(visitors, visitor);
};

var isParentReactElement = function isParentReactElement(nodePath) {
  var parentNode = nodePath.parentPath.parent;

  if (types.isFunctionDeclaration(parentNode) || types.isArrowFunctionExpression(parentNode) || types.isFunctionExpression(parentNode)) {
    if (types.isFunctionDeclaration(parentNode)) {
      // const funcFirstLetter = (parentNode.id.name || "r")[0]; // r is just a dummy variable that results to false
      return /^_?[A-Z]/.test(parentNode.id ? parentNode.id.name : "") || /^use/.test(parentNode.id ? parentNode.id.name : ""); // ? true
      // : false;
    } // if (types.isArrowFunctionExpression(parentNode)) {


    parentNode = nodePath.parentPath.parentPath.parent;
    return /^_?[A-Z]/.test(parentNode.id ? parentNode.id.name : "") || /^use/.test(parentNode.id ? parentNode.id.name : ""); // const funcFirstLetter = (parentNode.id.name || "r")[0];
    // return funcFirstLetter.toUpperCase() === funcFirstLetter ||
    //   /^use/.test(parentNode.id.name)
    //   ? true
    //   : false;
    // }
  } else {
    return false;
  } // return false;

};

var makeCallerFuncAsync = function makeCallerFuncAsync(path) {
  var funcExp = null;

  var reculsive = function reculsive(parentPath) {
    if (types.isArrowFunctionExpression(parentPath.parent) || types.isFunctionExpression(parentPath.parent)) {
      funcExp = parentPath.parent;
    } else {
      reculsive(parentPath.parentPath);
    }
  };

  reculsive(path.parentPath);
  if (funcExp) funcExp.async = true;
  return funcExp;
};

addVisitor(declarationVisitor);
addVisitor(expressionVisistor);

function astTransfromFunction() {
  return {
    name: "react annnotated",
    pre: function pre() {},
    visitor: visitors,
    post: function post(state) {}
  };
}

module.exports = astTransfromFunction;