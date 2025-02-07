import CssBaseline from "@mui/material/CssBaseline";
import Hero from "./components/Hero";
import Auth from "./components/Auth";
import Navbar from "./components/Navbar";
import React from "react";

const App = () => {
  return (
    <>
      <CssBaseline />
      {/* <Auth /> */}

      <Navbar />
      <Hero />
    </>
  );
};

export default App;
