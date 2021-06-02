import Cre from "./cre";

/** @jsx Cre.createElement */
function App(props) {
  const [time, setTime] = Cre.useState(0);
  return (
    <div>
      <h1>
        hello {props.name} {time}
      </h1>
      <div
        onClick={() => {
          setTime((time) => time + 1);
        }}
      >
        {time}
      </div>
    </div>
  );
}

const container = document.getElementById("root");

Cre.render(<App name="world" />, container);
