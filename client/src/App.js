import React, { useEffect } from "react";

const App = () => {
  useEffect(() => {
    fetch("/api/v1/locations/testing")
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div>
      <h1>Chicago Boost App</h1>
    </div>
  );
};

export default App;
