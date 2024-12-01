import React from "react";

import Chat from "./Chat";

const Home = (props) => {
  const {showAlert}=props;
  return (
    <div>
      <Chat showAlert={showAlert}/>
    </div>
  );
};

export default Home;