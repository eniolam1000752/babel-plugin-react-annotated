const transverse = require("@babel/traverse");
const types = require("@babel/types");
const babelTemplate = require("@babel/template");

const stateAnnotation = /^\s*@state\s*$/;
const setStatePrefix = "SET";
const statePrefix = "__";
const DUMMY_NAME = `_RN_${genVar()}`;
let annotatedStateList = [];
let stateNames = [];
let visitors = {};
const template = babelTemplate.default;

const _useStateTemplate = function(initValueNode, idText) {
  let leftExpression = types.arrayPattern([
    types.identifier(idText),
    types.identifier(`${setStatePrefix}${idText}`)
  ]);
  let RightExpression = types.callExpression(
    types.memberExpression(
      types.identifier("React"),
      types.identifier("useState")
    ),
    [initValueNode]
  );
  return types.variableDeclarator(leftExpression, RightExpression);
};

const _updateExpressionTemplate = function(updateNode, trueVarName) {
  const buildASTNode = template(
    `${setStatePrefix}${trueVarName}(STATE_NAME => {UPDATE_EXP; return STATE_NAME})`
  );
  return buildASTNode({
    UPDATE_EXP: updateNode,
    STATE_NAME: DUMMY_NAME
  });
};

const _updateExpressionTemplate2 = function(
  dummyVar,
  updateNode,
  nestNode,
  trueVarName
) {
  const buildASTNode = template(
    `${setStatePrefix}${trueVarName}(STATE_NAME => {UPDATE_EXP;NEST_STATE_NODE ;return STATE_NAME})`
  );
  return buildASTNode({
    UPDATE_EXP: updateNode,
    NEST_STATE_NODE: nestNode,
    STATE_NAME: dummyVar
  });
};

const _nestedUpdateExpTemplate = function(
  dummyVar,
  nestNode,
  higerStateName,
  trueVar,
  LONA
) {
  const leftNodeOfNextAssignment = types.cloneNode(LONA);
  const isLeftMemberExp = types.isMemberExpression(trueVar);
  const isNextLeftMemberExp = types.isMemberExpression(
    leftNodeOfNextAssignment
  );
  const leftExpClone = types.cloneNode(trueVar);
  const buildASTNode = !isLeftMemberExp
    ? template(
        `${setStatePrefix}${trueVar.name}(STATE_NAME => {STATE_NAME = HIGH_STATE_NAME; NEST_STATE_NODE ;return STATE_NAME})`
      )
    : template(
        `${setStatePrefix}${getMemberExpStateName(
          trueVar
        )}(STATE_NAME => {LEFT_EXP  = HIGH_STATE_NAME; NEST_STATE_NODE ;return STATE_NAME})`
      );

  if (isNextLeftMemberExp)
    replaceStateWithDummyInMemberExp(leftNodeOfNextAssignment, higerStateName);

  let out = {
    HIGH_STATE_NAME: !isNextLeftMemberExp
      ? higerStateName
      : leftNodeOfNextAssignment,
    NEST_STATE_NODE: nestNode,
    STATE_NAME: dummyVar
  };
  if (isLeftMemberExp) replaceStateWithDummyInMemberExp(leftExpClone, dummyVar);
  return buildASTNode(
    !isLeftMemberExp ? out : { ...out, LEFT_EXP: leftExpClone }
  );
  // console.log("transformed output oooo: ", nestNode, outlet);
  // return outlet;
};

const assignmentTemplate = function(leftNode, rightNode) {
  const isLeftMemberExp = types.isMemberExpression(leftNode);
  const buildAstNode = template(`VAR_NAME = RIGHT_NODE`);
  let out = {
    VAR_NAME: leftNode.name,
    RIGHT_NODE: rightNode
  };
  return buildAstNode(!isLeftMemberExp ? out : { ...out, VAR_NAME: leftNode });
};

const getMemberExpStateName = function(memberExp) {
  let out = null;
  let func = exp => {
    if (types.isMemberExpression(exp.object)) {
      func(exp.object);
    } else {
      out = exp.object.name;
    }
  };
  func(memberExp);
  return out;
};

const declearedStateTransform = function(programNode) {
  annotatedStateList.forEach(item =>
    transverse(programNode, reactStateExpressionFinder, null, {
      varName: item.id.name
    })
  );
};

const transformer = function(node, type) {
  switch (type) {
    case "toUseState":
      return _useStateTemplate(node.init, node.id.name);
    default:
      return null;
  }
};

const check__PrefixSyntax = function(node) {
  for (let item of node.declarations) {
    let varName = item.id.name;

    if (new RegExp(`^${statePrefix}\\w+$`).test(varName)) {
      throw new SyntaxError(
        `Error in build: non anotated variable should not have '${statePrefix}' prefix for variable: '${varName}'`
      );
    }
  }
};
const checkAnnotatedSyntax = function(node) {
  const declarations = types.cloneNode(node).declarations;
  node.declarations = [];
  for (let item of declarations) {
    let varName = item.id.name;

    if (!new RegExp(`^${statePrefix}\\w+$`).test(varName)) {
      throw new SyntaxError(
        `Error in build: anotated variable should have prefix '${statePrefix}' for variable: '${varName}'. try adding '${statePrefix}' or remove annoation `
      );
    } else {
      stateCollector(item);
      trasfromDeclearationsToUseState(node, item);
    }
  }
};

function genVar() {
  const randVar = `${Math.random()}`;
  return randVar.slice(2, randVar.length - 9);
}

const exceptionMsg = function(type, data, errType = null) {};

const addVisitor = function(visitor) {
  Object.assign(visitors, visitor);
};

const declarationVisitor = {
  VariableDeclaration(path) {
    const node = path.node;
    const immidateTopComment = node.leadingComments
      ? node.leadingComments[node.leadingComments.length - 1]
      : null;
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
    } else {
      checkAnnotatedSyntax(node);
      cleanUpAnnotations(node);
    }
  }
};

const expressionVisistor = {
  AssignmentExpression(path) {
    let node = path.node;
    this.varName =
      stateNames.indexOf(node.left.name) !== -1 ? node.left.name : null;

    // checks and performs transform on single assginments
    if (this.varName && !types.isAssignmentExpression(node.right)) {
      // console.log("found a state assignment: ", path);
      path.traverse(
        {
          Identifier(path) {
            if (path.node.name === this.varName) {
              path.replaceWith(types.identifier(DUMMY_NAME));
            }
          }
        },
        { varName: this.varName }
      );
      path.replaceWith(_updateExpressionTemplate(node, this.varName));
    }

    // checks and perform transform on nested assignment
    if (
      types.isAssignmentExpression(node.right) &&
      !types.isAssignmentExpression(path.parent)
    ) {
      // console.log("found a nested assignment ooo: ", path);
      let resultAssignNode = null;
      let higherState = null;

      let reculsive = assignNode => {
        if (
          types.isAssignmentExpression(assignNode.right) &&
          stateNames.indexOf(
            assignNode.left.name || getMemberExpStateName(assignNode.left)
          ) !== -1
            ? true
            : assignNode.right.operator === "="
        ) {
          resultAssignNode =
            stateNames.indexOf(
              assignNode.left.name || getMemberExpStateName(assignNode.left)
            ) !== -1
              ? _nestedUpdateExpTemplate(
                  higherState || `_RN_${genVar()}`,
                  resultAssignNode,
                  (higherState = `_RN_${genVar()}`),
                  assignNode.left,
                  assignNode.right.left
                )
              : !resultAssignNode
              ? assignmentTemplate(
                  assignNode.left,
                  (higherState = `_RN_${genVar()}`)
                )
              : !resultAssignNode.length
              ? [
                  assignmentTemplate(assignNode.left, higherState),
                  resultAssignNode
                ]
              : [
                  assignmentTemplate(assignNode.left, higherState),
                  ...resultAssignNode
                ];
          // console.log("result exp: ", types.cloneNode(resultAssignNode));
          reculsive(assignNode.right);
        } else {
          if (resultAssignNode) {
            const leftName = assignNode.left.name.slice();
            const leftNode = types.cloneNode(assignNode.left);
            const higherStateNode = types.cloneNode(assignNode.left);
            higherStateNode.name = higherState;
            assignNode.left.name = higherState;
            // console.log("result2: ", resultAssignNode);

            resultAssignNode =
              stateNames.indexOf(leftName) !== -1
                ? _updateExpressionTemplate2(
                    higherState,
                    assignNode,
                    resultAssignNode,
                    leftName
                  )
                : !resultAssignNode.length
                ? [
                    assignmentTemplate(higherStateNode, assignNode.right),
                    assignmentTemplate(leftNode, higherState),
                    resultAssignNode
                  ]
                : [
                    assignmentTemplate(higherStateNode, assignNode.right),
                    assignmentTemplate(leftNode, higherState),
                    ...resultAssignNode
                  ];
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
    }

    // checks and perform transfroms on assignments whose right is an object with a property to update eg (object.propery = 3)
    if (
      types.isMemberExpression(node.left) &&
      !types.isAssignmentExpression(path.parent) &&
      !types.isAssignmentExpression(node.right)
    ) {
      this.varName =
        stateNames.indexOf(getMemberExpStateName(node.left)) !== -1
          ? getMemberExpStateName(node.left)
          : null;

      // console.log("found an object assignment: ", this.varName);
      path.traverse(
        {
          Identifier(path) {
            if (path.node.name === this.varName) {
              path.replaceWith(types.identifier(DUMMY_NAME));
              this.assignmentPath.replaceWith(
                _updateExpressionTemplate(
                  this.assignmentPath.node,
                  this.varName
                )
              );
            }
          }
        },
        { varName: this.varName, assignmentPath: path }
      );
    }
  },

  // checks and transfroms update expressions like (++i & i--)
  UpdateExpression(path) {
    let node = path.node;
    this.varName =
      stateNames.indexOf(node.argument.name) !== -1 ? node.argument.name : null;
    if (this.varName && !types.isAssignmentExpression(path.parent)) {
      // console.log("found an update expression: ", path);
      path.traverse(
        {
          Identifier(path) {
            if (path.node.name === this.varName) {
              path.replaceWith(types.identifier(DUMMY_NAME));
            }
          }
        },
        { varName: this.varName }
      );
      path.replaceWith(_updateExpressionTemplate(node, this.varName));
    }
  }
};

const stateCollector = function(declearNode) {
  let varName = declearNode.id.name;
  annotatedStateList.push(declearNode);
  stateNames.push(varName);
};

const trasfromDeclearationsToUseState = function(node, declearNode) {
  node.declarations.push(transformer(declearNode, "toUseState"));
};

const replaceStateWithDummyInMemberExp = (memberExp, dummyVar) => {
  let func = exp => {
    if (types.isMemberExpression(exp.object)) {
      func(exp.object);
    } else {
      exp.object.name = dummyVar;
    }
  };
  func(memberExp);
};

const cleanUpAnnotations = function(node) {
  node.leadingComments = node.leadingComments
    ? node.leadingComments.filter(item => {
        return !item.value.match(/^@\w+$/) ? item : null;
      })
    : null;
  node.trailingComments = node.trailingComments
    ? node.trailingComments.filter(item =>
        !item.value.match(/^@\w+$/) ? item : null
      )
    : null;
};

addVisitor({
  AssignmentExpression(path, state) {
    // console.log(state);
  }
});
addVisitor(declarationVisitor);
addVisitor(expressionVisistor);

function astTransfromFunction() {
  return {
    pre() {},
    visitor: visitors,
    post(val) {
      // console.log("after transverse:", val);
    }
  };
}

module.exports = astTransfromFunction;
