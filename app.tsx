import Pre from "./pre";

/** @jsx Pre.createElement */
function App(props) {
  const [time, setTime] = Pre.useState(0);
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

Pre.render(<App name="world" />, container);
