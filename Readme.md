# babel-plugin-react-annotated

A simple '@' annotation prefixed single line comment that cuts down time wasted on unnecessary instantiation or setting of react's state ( writing less coding more ).

#### native react's way

```jsx
/* react state declaration */
const [count, setCount] = React.useState(0);

/* variable usage and setter */
const Component = () => (
  <div onClick={() => setCount(count + 1)}>Counting Number: {count}</div>
);
```

#### react-annotated's way

```jsx
/* react state declaration */

//@state
let count = 0;

/* variable usage */
const Component = () => (
  <div
    onClick={function() {
      ++count;
    }}
  >
    Counting Number: {count}
  </div>
);
```

## Behind the hood

react-annotated is a babel plugin providing transformation of annotated declarations to it's equivalent native react transform on build time, resulting to zero latency effect at run-time.

#### transformation

```jsx
//@state
let variable = "a word";

/* transforms to */
const [{ variable }, _SET__variable] = React.useState({ variable: "a word" });
```

## Installation

```batch
    npm install --save-dev babel-plugin-react-annotated
```

## Available annotations

- @state
- @init

## Usage

Note: react-annotated works for only functional react not classes.

#### Creating a react state

Declaring a react state is as simple as declaring a javascript variable though it's requires;

- A single line comment annotation with the @ prefix at the top of the declaration (just like a flow annotation).

##### single state declaration

```jsx
//@state
let varable = 0;
```

##### multiple state declaration

```jsx
    //@state
    let varable = 0,
	    variable2 = 'string',
	    variable 3 = {},
	    varaible4 = [];
```

#### Using a react state

```jsx
//@state
let variable = 0;

const Component = (props) => {
  return <div>{variable} </div>;
};

/* output */
<div> 0 </div>;
```

#### Setting a react state

Setting a react's state is simply assigning a new value to the declared variable just as a usual javascript variable.
This can either be

- An update expression
- A single assignment expression
- A nested assignment expression

##### Update Expression

```jsx
//@state
let variable = 0;

const Component = (props) => (
  <div
    onClick={function() {
      ++variable;
    }}
  >
    Counting Number: {variable}
  </div>
);
```

##### Assignment Expression

```jsx
//@state
let variable = 0;
//@state
let obj = { keyVar: "" };

const Component = (props) => (
  <div
    onClick={() => {
      variable = "new value as string";
      obj.keyVar = "new value";
    }}
  >
    Counting Number: {variable}
    object value for key (keyVar): {obj.keyVar}
  </div>
);
```

##### Nested assignment Expression

```jsx
//@state
let variable = 0;
//@state
let variable2 = 3;
//@state
let obj = { keyVar: 0 };

let nonState = 5;

const Component = (props) => (
  <div
    onClick={() => {
      obj.keyVar = variable = variable2 = ++nonState;
    }}
  >
    Counting Number 1: {variable}
    Counting Number 2: {variable2}
    Counting Number 3: {obj.keyVar}
  </div>
);
```

### @init annotation

Making a function/arrow function decleration execute at the begining of a component rending is as easy as just annotating the function with @init

```jsx
//@init
function runInitially() {
  console.log("i ran when the component was mounted and would not run again");
}
```

if the decleared function takes an argument then the following can be done

```jsx
//@init('arg1', 3, {}, [])
function runInitiallyWithArguments(stringArg, numberArg, objectArg, arrayArg) {
  console.log(
    "i ran when the component was mounted but with this arguments: ",
    stringArg,
    numberArg,
    objectArg,
    arrayArg
  );
}
```

#### Dependencies

- [@babel/types](https://github.com/babel/babel/tree/master/packages/babel-types/src/definitions)
- [@babel/template](https://github.com/babel/babel/tree/master/packages/babel-template)
