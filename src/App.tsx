import CssBaseline from "@mui/material/CssBaseline";
import Hero from "./components/Hero";
import Auth from "./components/Auth";
import Navbar from "./components/Navbar";
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [isNavModalOpen, setIsNavModalOpen] = React.useState(false);
  console.log("!!* isNavModalOpen main", isNavModalOpen);
  return (
    <>
      <CssBaseline />
      {/* <Auth /> */}
      <ToastContainer position='top-right' autoClose={3000} />

      <Navbar setIsNavModalOpen={setIsNavModalOpen} />
      <Hero
        isNavModalOpen={isNavModalOpen}
        setIsNavModalOpen={setIsNavModalOpen}
      />
    </>
  );
};

export default App;
