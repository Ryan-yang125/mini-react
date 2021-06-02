/** @jsx Cre.createElement */
import Cre from "./cre";

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

export default Counter;
