import Pre from "./pre";

/** @jsx Pre.createElement */
const element = (
  <div id="foo">
    <p>hello</p>
    <a />
  </div>
);

const container = document.getElementById("root");

Pre.render(element, container);