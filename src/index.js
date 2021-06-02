import Cre from "./cre";

/** @jsx Cre.createElement */

function Counter() {
  const [value, setValue] = Cre.useState(0);
  return (
    <div>
      <div>{value}</div>
      <button onClick={() => setValue(value + 1)}>Increment</button>
      <button onClick={() => setValue(value - 1)}>Decrement</button>
    </div>
  );
}

function TodoList() {
  const [text, setText] = Cre.useState("");
  const [todos, setTodos] = Cre.useState([]);
  const addTodo = () => {};
  const lists = todos.map((todo) => <li>{todo}</li>);
  return (
    <form onSubmit={addTodo}>
      <label>
        <span>Add Todo</span>
        <input value={text} onInput={(e) => setText(e.target.value)} />
      </label>
      <button type="submit">Add</button>
      <ul>{lists}</ul>
    </form>
  );
}
function App(props) {
  return (
    <div>
      <h1>hello {props.name}</h1>
      <div className="demo">
        <h2>demo 1 : Counter</h2>
        <Counter />
      </div>
      <div className="demo">
        <h2>demo 2 : TodoList</h2>
        <TodoList />
      </div>
    </div>
  );
}

const container = document.getElementById("root");

Cre.render(<App name="Cre" />, container);
