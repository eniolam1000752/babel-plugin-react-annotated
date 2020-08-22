const types = require("@babel/types");

const template = require("@babel/template").default;

const stateAnnotation = /^\s*@state\s*$/;
const setStatePrefix = "SET__";
const statePrefix = "__";
const DUMMY_NAME = `_RN_${genVar()}`;
const initTag = "@ -% init %-";
let annotatedStateList = [];
let stateNames = [];
let visitors = {};
let expTracker = [];
let useEffectNode = null;

const _useStateTemplate = function(initValueNode, idText) {
  types.identifier(`${setStatePrefix}${idText}`);
  const objectConstruct = types.objectExpression([
    types.objectProperty(types.identifier(idText), initValueNode),
  ]);
  const leftExpression = types.arrayPattern([
    types.objectPattern([
      types.objectProperty(
        types.identifier(idText),
        types.identifier(idText),
        false,
        true
      ),
    ]),
    types.identifier(`${setStatePrefix}${idText}`),
  ]);
  const RightExpression = types.callExpression(
    types.memberExpression(
      types.identifier("React"),
      types.identifier("useState")
    ),
    [objectConstruct]
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
    STATE_NAME: DUMMY_NAME,
  });
};

const clonedStateExp = function(varName) {
  return types.expressionStatement(
    types.assignmentExpression(
      "=",
      types.identifier(varName || DUMMY_NAME),
      types.callExpression(
        types.memberExpression(
          types.identifier("JSON"),
          types.identifier("parse")
        ),
        [
          types.callExpression(
            types.memberExpression(
              types.identifier("JSON"),
              types.identifier("stringify")
            ),
            [types.identifier(varName || DUMMY_NAME)]
          ),
        ]
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
  const buildASTNode = template(
    `${setStatePrefix}${trueVar.name ||
      getMemberExpStateName(
        trueVar
      )}(STATE_NAME => {UPDATE_EXP;NEST_STATE_NODE ;return STATE_NAME})`
  );

  if (isLeftMemberExp) {
    replaceStateWithDummyInMemberExp(
      updateNode.left,
      dummyVar,
      memberExpNode(getMemberExpStateName(trueVar), dummyVar)
    );
  } else {
    if (types.isIdentifier(updateNode.left)) {
      updateNode.left = memberExpNode(trueVar.name, dummyVar);
    }
  }

  updateNode = types.expressionStatement(updateNode);
  return buildASTNode({
    UPDATE_EXP: [clonedStateExp(dummyVar), updateNode],
    NEST_STATE_NODE: nestNode,
    STATE_NAME: dummyVar,
  });
};

const _nestedUpdateExpTemplate = function(
  dummyVar,
  nestNode,
  higerStateName,
  trueVar,
  LONA,
  path
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

  if (isNextLeftMemberExp && isIdentifierReactState(path, nextAssignLeft)) {
    replaceStateWithDummyInMemberExp(
      leftNodeOfNextAssignment,
      higerStateName,
      memberExpNode(nextAssignLeft, higerStateName)
    );
  }

  if (!isNextLeftMemberExp && isIdentifierReactState(path, nextAssignLeft)) {
    higerStateName = memberExpNode(nextAssignLeft, higerStateName);
  }

  const temp = !isNextLeftMemberExp ? higerStateName : leftNodeOfNextAssignment;
  const temp2 = !isIdentifierReactState(path, nextAssignLeft)
    ? leftNodeOfNextAssignment
    : temp;
  let out = {
    HIGH_STATE_NAME: temp2,
    NEST_STATE_NODE: nestNode,
    STATE_NAME: dummyVar,
    STATE_CLONE: clonedStateExp(dummyVar),
  };

  if (isLeftMemberExp) {
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
          ),
        }
      : { ...out, LEFT_EXP: leftExpClone }
  );
};

const assignmentTemplate = function(leftNode, rightNode, LONA, node, path) {
  const leftNodeOfNextAssignment = LONA ? types.cloneNode(LONA) : null;
  const isNextLeftMemberExp = LONA
    ? types.isMemberExpression(leftNodeOfNextAssignment)
    : null;
  const buildAstNode = template(`VAR_NAME = RIGHT_NODE`);
  const varInExp = LONA
    ? leftNodeOfNextAssignment.name ||
      getMemberExpStateName(leftNodeOfNextAssignment)
    : null;

  if (LONA) {
    if (LONA && isNextLeftMemberExp && isIdentifierReactState(path, varInExp)) {
      replaceStateWithDummyInMemberExp(
        leftNodeOfNextAssignment,
        rightNode,
        memberExpNode(
          getMemberExpStateName(leftNodeOfNextAssignment),
          rightNode
        )
      );
    } else {
      rightNode = !isIdentifierReactState(path, varInExp)
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
      : rightNode,
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

const _stateWithReturnTemplate = function(equivNodeRight, name, nameExp) {
  const setStateNode = template(
    `${setStatePrefix}${name}( ARGS => { NODE_EQUIV; return ARGS;  })`
  );
  const declare1 = types.variableDeclaration("let", [
    types.variableDeclarator(types.identifier(DUMMY_NAME), nameExp.argument),
  ]);
  const tempNode = types.cloneNode(equivNodeRight);
  tempNode.argument = types.identifier(DUMMY_NAME);
  const declare2 = setStateNode({
    NODE_EQUIV: [clonedStateExp(), types.expressionStatement(equivNodeRight)],
    ARGS: DUMMY_NAME,
  });
  const declare3 = types.returnStatement(tempNode);
  const block = types.blockStatement([declare1, declare2, declare3]);
  const arrowFunc = types.arrowFunctionExpression([], block);
  return types.callExpression(arrowFunc, []);
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
    stateCollector(item);
    trasfromDeclearationsToUseState(node, item);
  }
};

function isIdentifierReactState(path, varName) {
  const scope = path ? path.scope : null;
  const bindings = scope ? scope.bindings : null;

  if (bindings) {
    console.log("Bindings: ", Object.keys(bindings), !!bindings[varName]);
  }

  if (!isNodeReactState(varName)) return 0;

  if (scope && bindings[varName]) {
    const parentNode = scope.path.parent;
    let isReactComponentBlock = false;

    if (
      (types.isArrowFunctionExpression(scope.block) ||
        types.isFunctionExpression(scope.block)) &&
      types.isVariableDeclarator(parentNode) &&
      types.isIdentifier(parentNode.id)
    ) {
      isReactComponentBlock =
        /^use/.test(parentNode.id.name) || /^_?[A-Z]/.test(parentNode.id.name);
    } else if (
      types.isFunctionDeclaration(scope.block) &&
      types.isIdentifier(scope.block.id)
    ) {
      isReactComponentBlock =
        /^use/.test(scope.block.id.name) ||
        /^_?[A-Z]/.test(scope.block.id.name);
    }

    return isNodeReactState(varName) && isReactComponentBlock;
  }

  if (scope) {
    return isIdentifierReactState(scope.path.parentPath, varName);
  }

  return false;
}

const declarationVisitor = {
  VariableDeclaration(path) {
    const node = path.node;
    const immidateTopComment = node.leadingComments
      ? node.leadingComments[node.leadingComments.length - 1]
      : null;

    if (!immidateTopComment) {
      return 0;
    }

    if (node.leadingComments.length === 0) {
      return 0;
    }

    if (!stateAnnotation.test(immidateTopComment.value)) {
      initExpression({ ...path }, path, "DECLARE");
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
  },
};
const expressionVisistor = {
  AssignmentExpression(path) {
    const clonePath = { ...path };
    let node = path.node;
    this.varName =
      stateNames.indexOf(node.left.name || getMemberExpStateName(node.left)) !==
      -1
        ? node.left.name || getMemberExpStateName(node.left)
        : null;

    if (
      this.varName &&
      !types.isAssignmentExpression(node.right) &&
      isIdentifierReactState(path, this.varName)
    ) {
      path.traverse(
        {
          Identifier(path) {
            if (path.node.name === this.varName) {
              path._replaceWith(memberExpNode(this.varName));
            }
          },
        },
        {
          varName: this.varName,
        }
      );

      if (
        types.isUpdateExpression(node.right) &&
        isIdentifierReactState(path, node.right.argument)
      ) {
        const dumVar = DUMMY_NAME;
        const nodeClone = types.cloneNode(node.right);
        const args = nodeClone.argument;
        const name = args.name || getMemberExpStateName(args);

        if (types.isMemberExpression(node.right.argument)) {
          replaceStateWithDummyInMemberExp(
            node.right.argument,
            dumVar,
            memberExpNode(name, dumVar)
          );
        } else if (types.isIdentifier(node.right.argument)) {
          node.right.argument = memberExpNode(name, dumVar);
        }

        node.right = _stateWithReturnTemplate(
          types.cloneNode(node.right),
          name,
          nodeClone
        );
      }

      path.replaceWith(_updateExpressionTemplate(node, this.varName));
    }

    if (
      types.isAssignmentExpression(node.right) &&
      !types.isAssignmentExpression(path.parent)
    ) {
      let resultAssignNode = null;
      let higherState = null;

      let reculsive = (assignNode) => {
        if (
          types.isAssignmentExpression(assignNode.right) &&
          isIdentifierReactState(
            path,
            assignNode.left.name || getMemberExpStateName(assignNode.left)
          )
            ? true
            : assignNode.right.operator === "="
        ) {
          resultAssignNode = isIdentifierReactState(
            path,
            assignNode.left.name || getMemberExpStateName(assignNode.left)
          )
            ? _nestedUpdateExpTemplate(
                higherState || `_RN_${genVar()}`,
                resultAssignNode,
                (higherState = `_RN_${genVar()}`),
                assignNode.left,
                assignNode.right.left,
                path
              )
            : !resultAssignNode
            ? assignmentTemplate(
                assignNode.left,
                (higherState = `_RN_${genVar()}`),
                assignNode.right.left,
                null,
                path
              )
            : !resultAssignNode.length
            ? [
                assignmentTemplate(
                  assignNode.left,
                  higherState,
                  assignNode.right.left,
                  null,
                  path
                ),
                resultAssignNode,
              ]
            : [
                assignmentTemplate(
                  assignNode.left,
                  higherState,
                  assignNode.right.left,
                  null,
                  path
                ),
                ...resultAssignNode,
              ];
          reculsive(assignNode.right);
        } else {
          if (resultAssignNode) {
            let higherStateNode = types.cloneNode(assignNode.left);
            const leftNode = types.cloneNode(assignNode.left);
            const varInExp = leftNode.name || getMemberExpStateName(leftNode);
            higherStateNode = types.identifier(higherState);
            console.log(assignNode.right.argument);

            if (
              types.isUpdateExpression(assignNode.right) &&
              isIdentifierReactState(
                path,
                assignNode.right.argument.name ||
                  getMemberExpStateName(assignNode.right.argument)
              )
            ) {
              const nodeClone = types.cloneNode(assignNode.right);
              const args = nodeClone.argument;
              const name = args.name || getMemberExpStateName(args);

              if (types.isMemberExpression(assignNode.right.argument)) {
                replaceStateWithDummyInMemberExp(
                  assignNode.right.argument,
                  DUMMY_NAME,
                  memberExpNode(name, DUMMY_NAME)
                );
              } else if (types.isIdentifier(assignNode.right.argument)) {
                assignNode.right.argument.name = DUMMY_NAME;
              }

              assignNode.right = _stateWithReturnTemplate(
                types.cloneNode(assignNode.right),
                name,
                nodeClone
              );
            }

            resultAssignNode = isIdentifierReactState(path, varInExp)
              ? _updateExpressionTemplate2(
                  higherState,
                  assignNode,
                  resultAssignNode,
                  leftNode
                )
              : !resultAssignNode.length
              ? [
                  assignmentTemplate(
                    higherStateNode,
                    assignNode.right,
                    null,
                    null,
                    path
                  ),
                  assignmentTemplate(
                    leftNode,
                    higherState,
                    null,
                    assignNode,
                    path
                  ),
                  resultAssignNode,
                ]
              : [
                  assignmentTemplate(
                    higherStateNode,
                    assignNode.right,
                    null,
                    null,
                    path
                  ),
                  assignmentTemplate(
                    leftNode,
                    higherState,
                    null,
                    assignNode,
                    path
                  ),
                  ...resultAssignNode,
                ];
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
    }

    if (
      types.isMemberExpression(node.left) &&
      !types.isAssignmentExpression(path.parent) &&
      !types.isAssignmentExpression(node.right)
    ) {
      this.varName = isIdentifierReactState(
        path,
        getMemberExpStateName(node.left)
      )
        ? getMemberExpStateName(node.left)
        : null;
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
          },
        },
        {
          varName: this.varName,
          assignmentPath: path,
        }
      );
    }

    initExpression(clonePath, path);
  },

  UpdateExpression(path) {
    const node = path.node;
    const nodeClone = types.cloneNode(node);
    const args = node.argument;
    this.varName = isIdentifierReactState(
      path,
      args.name || getMemberExpStateName(args)
    )
      ? args.name || getMemberExpStateName(args)
      : null;

    if (this.varName && !types.isAssignmentExpression(path.parent)) {
      if (types.isMemberExpression(args)) {
        replaceStateWithDummyInMemberExp(
          args,
          null,
          memberExpNode(this.varName, DUMMY_NAME)
        );
      } else if (types.isIdentifier(args)) {
        node.argument = memberExpNode(this.varName, DUMMY_NAME);
      }

      path.replaceWith(_stateWithReturnTemplate(node, this.varName, nodeClone));
    }
  },

  FunctionDeclaration(path) {
    initExpression({ ...path }, path, "DECLARE");
  },

  CallExpression(path) {
    const callee = path.node.callee;

    if (!(types.isIdentifier(callee) && /^use/.test(callee.name))) {
      initExpression({ ...path }, path);
    }
  },

  BlockStatement(path) {
    const node = path.node;
    const immidateTopComment = node.leadingComments
      ? node.leadingComments[node.leadingComments.length - 1]
      : null;

    if (immidateTopComment && /^@zone\s*$/.test(immidateTopComment.value)) {
      path.replaceWith(
        types.expressionStatement(
          types.callExpression(
            types.arrowFunctionExpression([], node, true),
            []
          )
        )
      );
    }

    console.log("comments: ", immidateTopComment);
  },
};

function initAnnotationParser(annotation) {
  let params = annotation.match(/(?<=(\()).*(?=(\)))/g)[0].split(",");
  params = params.length === 1 && params[0] === "" ? [] : params;
  params = params
    .filter((item, index) => {
      return types.isExpressionStatement(template(item)());
    })
    .map((item) => template(item)().expression);
  return params;
}

function initExpression(path, transformedPath, typeExp) {
  const expStatement = typeExp === "DECLARE" ? path.node : path.parent;
  const immidateTopComment = expStatement.leadingComments
    ? expStatement.leadingComments[expStatement.leadingComments.length - 1]
    : null;

  if (
    immidateTopComment &&
    /\s*@init\s*(\(.*\))?\s*$/.test(immidateTopComment.value) &&
    immidateTopComment.type === "CommentLine"
  ) {
    let componentBlock = getParentComponentOrUseFuncBlock(path);
    let childToPut = types.cloneNode(transformedPath.node);

    if (typeExp === "DECLARE" && types.isFunctionDeclaration(path.node)) {
      childToPut = types.callExpression(
        types.identifier(path.node.id.name),
        initAnnotationParser(immidateTopComment.value)
      );
    }

    if (
      typeExp === "DECLARE" &&
      types.isVariableDeclaration(path.node) &&
      (types.isArrowFunctionExpression(path.node.declarations[0].init) ||
        types.isFunctionExpression(path.node.declarations[0].init))
    ) {
      childToPut = types.callExpression(
        types.identifier(path.node.declarations[0].id.name),
        initAnnotationParser(immidateTopComment.value)
      );
    }

    putNodeInUseEffect(componentBlock, childToPut);
    if (typeExp !== "DECLARE") transformedPath.remove();
  }
}

function putNodeInUseEffect(parentBlockExp, childNode) {
  console.log(" *********** putting data into use effect node *********** ");
  const node = template(`
      React.useEffect(()=>{ INIT_NODES; }, [])
      `)({
    INIT_NODES: childNode,
  });
  parentBlockExp.body = parentBlockExp.body.reduce(
    (cum, item) =>
      types.isReturnStatement(item) ? [...cum, node, item] : [...cum, item],
    []
  );
  useEffectNode = node;
}

const getParentComponentOrUseFuncBlock = function(path) {
  let out = null;

  const reculsive = function(parentPath) {
    let parentNode = {};

    if (
      types.isArrowFunctionExpression(parentPath.parent) ||
      types.isFunctionExpression(parentPath.parent)
    ) {
      parentNode = parentPath.parentPath.parentPath.parent.declarations
        ? parentPath.parentPath.parentPath.parent.declarations[0]
        : null;
    } else if (types.isFunctionDeclaration(parentPath.parent)) {
      parentNode = parentPath.parent;
    }

    if (
      parentNode &&
      parentNode.id &&
      (/[A-Z]/.test(parentNode.id.name[0]) ||
        /^use/.test(parentNode.id.name)) &&
      !/useEffect/.test(parentNode.id.name)
    ) {
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
  let func = (exp) => {
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
    ? node.leadingComments.filter((item) => {
        return !item.value.match(/^@\w+$/) ? item : null;
      })
    : null;
  node.trailingComments = node.trailingComments
    ? node.trailingComments.filter((item) =>
        !item.value.match(/^@\w+$/) ? item : null
      )
    : null;
};

const getMemberExpStateName = function(memberExp) {
  let out = null;

  let func = (exp) => {
    if (types.isMemberExpression(exp.object)) {
      func(exp.object);
    } else {
      out = exp.object.name;
    }
  };

  func(memberExp);
  return out;
};

const isNodeReactState = function(node) {
  if (node) {
    return typeof node === "string"
      ? stateNames.indexOf(node) !== -1
      : stateNames.indexOf(node.name || getMemberExpStateName(node)) !== -1;
  } else {
    return false;
  }
};

const memberExpNode = function(stateName, varName) {
  return types.memberExpression(
    types.identifier(varName || DUMMY_NAME),
    types.identifier(stateName)
  );
};

function genVar() {
  const randVar = `${Math.random()}`;
  return randVar.slice(2, randVar.length - 9);
}

const addVisitor = function(visitor) {
  Object.assign(visitors, visitor);
};

const isParentReactElement = function(nodePath) {
  let parentNode = nodePath.parentPath.parent;

  if (
    types.isFunctionDeclaration(parentNode) ||
    types.isArrowFunctionExpression(parentNode) ||
    types.isFunctionExpression(parentNode)
  ) {
    if (types.isFunctionDeclaration(parentNode)) {
      return (
        /^_?[A-Z]/.test(parentNode.id ? parentNode.id.name : "") ||
        /^use/.test(parentNode.id ? parentNode.id.name : "")
      );
    }

    parentNode = nodePath.parentPath.parentPath.parent;
    return (
      /^_?[A-Z]/.test(parentNode.id ? parentNode.id.name : "") ||
      /^use/.test(parentNode.id ? parentNode.id.name : "")
    );
  } else {
    return false;
  }
};

const makeCallerFuncAsync = function(path) {
  let funcExp = null;

  const reculsive = function(parentPath) {
    if (
      types.isArrowFunctionExpression(parentPath.parent) ||
      types.isFunctionExpression(parentPath.parent)
    ) {
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

    pre() {},

    visitor: visitors,

    post(state) {},
  };
}

module.exports = astTransfromFunction;
