// const transverse = require("@babel/traverse");
const types = require("@babel/types");
const template = require("@babel/template").default;

const stateAnnotation = /^\s*@state\s*$/;
const setStatePrefix = "SET";
const statePrefix = "__";
const DUMMY_NAME = `_RN_${genVar()}`;
let annotatedStateList = [];
let stateNames = [];
let visitors = {};

const _useStateTemplate = function(initValueNode, idText) {
  // const leftExpression = types.arrayPattern([
  //   types.identifier(idText),
  //   types.identifier(`${setStatePrefix}${idText}`)
  // ]);

  const objectConstruct = types.objectExpression([
    types.objectProperty(types.identifier(idText), initValueNode)
  ]);

  const leftExpression = types.arrayPattern([
    types.objectPattern([
      types.objectProperty(
        types.identifier(idText),
        types.identifier(idText),
        false,
        true
      )
    ]),
    types.identifier(`${setStatePrefix}${idText}`)
  ]);

  const RightExpression = types.callExpression(
    types.memberExpression(
      types.identifier("React"),
      types.identifier("useState")
    ),
    [objectConstruct /* initValueNode */]
  );
  return types.variableDeclarator(leftExpression, RightExpression);
};

const _updateExpressionTemplate = function(updateNode, trueVarName) {
  const buildASTNode = template(
    `${setStatePrefix}${trueVarName}(STATE_NAME => {UPDATE_EXP; return STATE_NAME})`
  );
  updateNode = types.expressionStatement(updateNode);

  return buildASTNode({
    UPDATE_EXP: [clonedStateExp(), updateNode],
    STATE_NAME: DUMMY_NAME
  });
};

const clonedStateExp = function(varName) {
  return types.expressionStatement(
    types.assignmentExpression(
      "=",
      types.identifier(varName || DUMMY_NAME),
      types.callExpression(
        types.memberExpression(
          types.identifier("Object"),
          types.identifier("assign")
        ),
        [types.objectExpression([]), types.identifier(varName || DUMMY_NAME)]
      )
    )
  );
};

const _updateExpressionTemplate2 = (
  dummyVar,
  updateNode,
  nestNode,
  trueVar
) => {
  const isLeftMemberExp = types.isMemberExpression(trueVar);
  // const clonedLeft = types.cloneNode(updateNode);
  // const leftExpClone = types.cloneNode(trueVar);
  const buildASTNode = template(
    `${setStatePrefix}${trueVar.name ||
      getMemberExpStateName(
        trueVar
      )}(STATE_NAME => {UPDATE_EXP;NEST_STATE_NODE ;return STATE_NAME})`
  );

  // if (isLeftMemberExp) {
  //   replaceStateWithDummyInMemberExp(updateNode.left, dummyVar);
  // } else {
  //   if (types.isIdentifier(updateNode.left)) {
  //     updateNode.left.name = dummyVar;
  //   }
  // }
  if (isLeftMemberExp) {
    replaceStateWithDummyInMemberExp(
      updateNode.left,
      dummyVar,
      memberExpNode(getMemberExpStateName(trueVar), dummyVar)
    );
  } else {
    if (types.isIdentifier(updateNode.left)) {
      updateNode.left = memberExpNode(
        trueVar.name,
        dummyVar
      ); /* types.identifier(dummyVar); */
    }
  }
  updateNode = types.expressionStatement(updateNode);

  return buildASTNode({
    UPDATE_EXP: [clonedStateExp(dummyVar), updateNode],
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
  const nextAssignLeft =
    leftNodeOfNextAssignment.name ||
    getMemberExpStateName(leftNodeOfNextAssignment);
  const leftExpClone = types.cloneNode(trueVar);
  const buildASTNode = !isLeftMemberExp
    ? template(
        `${setStatePrefix}${trueVar.name}(STATE_NAME => {STATE_CLONE; MEMBER_STATE_NAME = HIGH_STATE_NAME; NEST_STATE_NODE ;return STATE_NAME})`
      )
    : template(
        `${setStatePrefix}${getMemberExpStateName(
          trueVar
        )}(STATE_NAME => {STATE_CLONE;LEFT_EXP  = HIGH_STATE_NAME; NEST_STATE_NODE ;return STATE_NAME})`
      );

  if (isNextLeftMemberExp && stateNames.indexOf(nextAssignLeft) !== -1) {
    replaceStateWithDummyInMemberExp(
      leftNodeOfNextAssignment,
      higerStateName,
      memberExpNode(nextAssignLeft, higerStateName)
    );
  }
  if (!isNextLeftMemberExp && stateNames.indexOf(nextAssignLeft) !== -1) {
    higerStateName = memberExpNode(nextAssignLeft, dummyVar);
  }
  // console.log(
  //   "nest setstate builder: ",
  //   trueVar,
  //   leftNodeOfNextAssignment,
  //   nextAssignLeft
  // );

  const temp = !isNextLeftMemberExp ? higerStateName : leftNodeOfNextAssignment;
  const temp2 =
    stateNames.indexOf(nextAssignLeft) === -1 ? leftNodeOfNextAssignment : temp;
  let out = {
    HIGH_STATE_NAME: temp2,
    NEST_STATE_NODE: nestNode,
    STATE_NAME: dummyVar,
    STATE_CLONE: clonedStateExp(dummyVar)
  };
  if (isLeftMemberExp) {
    // replaceStateWithDummyInMemberExp(leftExpClone, dummyVar);
    replaceStateWithDummyInMemberExp(
      leftExpClone,
      dummyVar,
      memberExpNode(getMemberExpStateName(trueVar), dummyVar)
    );
  }

  return buildASTNode(
    !isLeftMemberExp
      ? {
          ...out,
          MEMBER_STATE_NAME: memberExpNode(
            trueVar.name || getMemberExpStateName(trueVar),
            dummyVar
          )
        }
      : { ...out, LEFT_EXP: leftExpClone }
  );
};

const assignmentTemplate = function(leftNode, rightNode, LONA, node) {
  // const isLeftMemberExp = types.isMemberExpression(leftNode);
  const leftNodeOfNextAssignment = LONA ? types.cloneNode(LONA) : null;
  const isNextLeftMemberExp = LONA
    ? types.isMemberExpression(leftNodeOfNextAssignment)
    : null;
  const buildAstNode = template(`VAR_NAME = RIGHT_NODE`);
  const varInExp = LONA
    ? leftNodeOfNextAssignment.name ||
      getMemberExpStateName(leftNodeOfNextAssignment)
    : null;

  // console.log(
  //   "test oooo: ",
  //   isNextLeftMemberExp && stateNames.indexOf(varInExp) !== -1,
  //   varInExp
  // );
  if (LONA) {
    if (LONA && isNextLeftMemberExp && stateNames.indexOf(varInExp) !== -1) {
      console.log("found a next assingment => ");
      replaceStateWithDummyInMemberExp(
        leftNodeOfNextAssignment,
        rightNode,
        memberExpNode(
          getMemberExpStateName(leftNodeOfNextAssignment),
          rightNode
        )
      );
    } else {
      rightNode = !isNodeReactState(varInExp)
        ? leftNodeOfNextAssignment.name
        : memberExpNode(leftNodeOfNextAssignment.name, rightNode);
    }
  }
  const out = {
    VAR_NAME: leftNode,
    RIGHT_NODE: LONA
      ? !isNextLeftMemberExp
        ? rightNode
        : leftNodeOfNextAssignment
      : rightNode
  };

  if (node && node.operator !== "=") {
    return types.assignmentExpression(
      node.operator,
      leftNode,
      types.identifier(out.RIGHT_NODE)
    );
  } else {
    return buildAstNode(out);
  }
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

const _stateWithReturnTemplate = function(equivNodeRight, name) {
  const setStateNode = template(
    `${setStatePrefix}${name}( _var_1234 => (NODE_EQUIV) )`
  );
  const declare1 = types.variableDeclaration("let", [
    types.variableDeclarator(
      types.identifier("_var_1234"),
      types.identifier(name)
    )
  ]);
  const declare2 = setStateNode({
    NODE_EQUIV: equivNodeRight
  });
  const declare3 = types.returnStatement(equivNodeRight);
  const block = types.blockStatement([declare1, declare2, declare3]);
  const arrowFunc = types.arrowFunctionExpression([], block);

  return types.callExpression(arrowFunc, []);
};

const isNodeReactState = function(node) {
  return typeof node === "string"
    ? stateNames.indexOf(node) !== -1
    : stateNames.indexOf(node.name || getMemberExpStateName(node)) !== -1;
};

const memberExpNode = function(stateName, varName) {
  return types.memberExpression(
    types.identifier(varName || DUMMY_NAME),
    types.identifier(stateName)
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

const check__PrefixSyntax = function(node, path) {
  for (let item of node.declarations) {
    let varName = item.id.name;

    if (new RegExp(`^${statePrefix}\\w+$`).test(varName)) {
      throw path.buildCodeFrameError(
        `Error in build: non anotated variable should not have '${statePrefix}' prefix for variable: '${varName}'`
      );
    }
  }
};
const checkAnnotatedSyntax = function(node, path) {
  const declarations = types.cloneNode(node).declarations;
  node.declarations = [];
  for (let item of declarations) {
    let varName = item.id.name;

    if (!new RegExp(`^${statePrefix}\\w+$`).test(varName)) {
      throw path.buildCodeFrameError(
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

// const exceptionMsg = function(type, data, errType = null) {};

const addVisitor = function(visitor) {
  Object.assign(visitors, visitor);
};
const isParentReactElement = function(nodePath) {
  let parentNode = nodePath.parentPath.parent;
  if (
    types.isFunctionDeclaration(parentNode) ||
    types.isArrowFunctionExpression(parentNode)
  ) {
    if (types.isFunctionDeclaration(parentNode)) {
      const funcFirstLetter = (parentNode.id.name || "r")[0]; // r is just a dummy variable that results to false
      return funcFirstLetter.toUpperCase() === funcFirstLetter ||
        /^use/.test(parentNode.id.name)
        ? true
        : false;
    }
    if (types.isArrowFunctionExpression(parentNode)) {
      parentNode = nodePath.parentPath.parentPath.parent;
      const funcFirstLetter = (parentNode.id.name || "r")[0];
      return funcFirstLetter.toUpperCase() === funcFirstLetter ||
        /^use/.test(parentNode.id.name)
        ? true
        : false;
    }
  } else {
    return false;
  }
  return false;
};

const declarationVisitor = {
  VariableDeclaration(path) {
    const node = path.node;
    const immidateTopComment = node.leadingComments
      ? node.leadingComments[node.leadingComments.length - 1]
      : null;
    if (!immidateTopComment) {
      check__PrefixSyntax(node, path);
      return 0;
    }
    if (node.leadingComments.length === 0) {
      check__PrefixSyntax(node, path);
      return 0;
    }
    if (!stateAnnotation.test(immidateTopComment.value)) {
      check__PrefixSyntax(node, path);
      return 0;
    }
    if (!isParentReactElement(path)) {
      throw path.buildCodeFrameError(
        `Error in build: state should be defined within a functional react element`
      );
    } else {
      checkAnnotatedSyntax(node, path);
      cleanUpAnnotations(node);
    }
  }
};

const expressionVisistor = {
  AssignmentExpression(path) {
    let node = path.node;
    this.varName =
      stateNames.indexOf(node.left.name || getMemberExpStateName(node.left)) !==
      -1
        ? node.left.name || getMemberExpStateName(node.left)
        : null;

    // checks and performs transform on single assginments
    if (this.varName && !types.isAssignmentExpression(node.right)) {
      // console.log("found a state assignment: ", path);
      path.traverse(
        {
          Identifier(path) {
            if (path.node.name === this.varName) {
              path._replaceWith(
                memberExpNode(this.varName) /* types.identifier(DUMMY_NAME) */
              );
            }
          }
        },
        { varName: this.varName }
      );
      if (
        types.isUpdateExpression(node.right) &&
        isNodeReactState(node.right.argument)
      ) {
        const args = types.cloneNode(node.right).argument;
        const name = args.name || getMemberExpStateName(args);
        if (types.isMemberExpression(node.right.argument)) {
          replaceStateWithDummyInMemberExp(node.right.argument, "_var_1234");
        } else if (types.isIdentifier(node.right.argument)) {
          node.right.argument.name = "_var_1234";
        }
        node.right = _stateWithReturnTemplate(
          types.cloneNode(node.right),
          name
        );
      }
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
                  (higherState = `_RN_${genVar()}`),
                  assignNode.right.left
                )
              : !resultAssignNode.length
              ? [
                  assignmentTemplate(
                    assignNode.left,
                    higherState,
                    assignNode.right.left
                  ),
                  resultAssignNode
                ]
              : [
                  assignmentTemplate(
                    assignNode.left,
                    higherState,
                    assignNode.right.left
                  ),
                  ...resultAssignNode
                ];
          // console.log("result exp: ", types.cloneNode(resultAssignNode));
          reculsive(assignNode.right);
        } else {
          if (resultAssignNode) {
            let higherStateNode = types.cloneNode(assignNode.left);
            const leftNode = types.cloneNode(assignNode.left);
            const varInExp = leftNode.name || getMemberExpStateName(leftNode);

            higherStateNode = types.identifier(higherState);

            if (
              types.isUpdateExpression(assignNode.right) &&
              isNodeReactState(assignNode.right.argument)
            ) {
              const args = types.cloneNode(assignNode.right).argument;
              const name = args.name || getMemberExpStateName(args);
              if (types.isMemberExpression(assignNode.right.argument)) {
                replaceStateWithDummyInMemberExp(
                  assignNode.right.argument,
                  "_var_1234"
                );
              } else if (types.isIdentifier(assignNode.right.argument)) {
                assignNode.right.argument.name = "_var_1234";
              }
              assignNode.right = _stateWithReturnTemplate(
                types.cloneNode(assignNode.right),
                name
              );
            }

            resultAssignNode =
              stateNames.indexOf(varInExp) !== -1
                ? _updateExpressionTemplate2(
                    higherState,
                    assignNode,
                    resultAssignNode,
                    leftNode
                  )
                : !resultAssignNode.length
                ? [
                    assignmentTemplate(higherStateNode, assignNode.right),
                    assignmentTemplate(leftNode, higherState, null, assignNode),
                    resultAssignNode
                  ]
                : [
                    assignmentTemplate(higherStateNode, assignNode.right),
                    assignmentTemplate(leftNode, higherState, null, assignNode),
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
    const node = path.node;
    const args = node.argument;
    // console.log("name: ", "");
    this.varName =
      // stateNames.indexOf(node.argument.name) !== -1 ? node.argument.name : null;
      isNodeReactState(args) ? args.name || getMemberExpStateName(args) : null;
    if (this.varName && !types.isAssignmentExpression(path.parent)) {
      console.log("found an update expression: ", this.varName);
      if (types.isMemberExpression(args)) {
        replaceStateWithDummyInMemberExp(
          args,
          null,
          memberExpNode(this.varName, DUMMY_NAME)
        );
      } else if (types.isIdentifier(args)) {
        node.argument = memberExpNode(this.varName, DUMMY_NAME);
      }
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
  node.kind = "const";
  node.declarations.push(transformer(declearNode, "toUseState"));
  ``;
};

const replaceStateWithDummyInMemberExp = (
  memberExp,
  dummyVar,
  overrideVarNode
) => {
  let func = exp => {
    if (types.isMemberExpression(exp.object)) {
      func(exp.object);
    } else {
      exp.object = overrideVarNode || types.identifier(dummyVar);
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
