import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import VimeoPlayer from "./VimeoPlayer";
import PurchaseModal from "./PurchaseModal";
import { useAuth } from "../providers/useAuth";
import { description, title } from "../utils/consts";
import { RegisterOrLoginModal } from "./RegisterOrLoginModal";

type HeroProps = {
  isNavModalOpen: boolean;
  setIsNavModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Hero: React.FC<HeroProps> = ({ isNavModalOpen, setIsNavModalOpen }) => {
  const { user, loading, authState, refetchUserData } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [loginErrors, setLoginErrors] = useState(false);
  console.log("!authState", authState);
  const handleOpenModal = () => setModalOpen(true);

  const handleClosePaymentModal = (
    reason?: "backdropClick" | "escapeKeyDown"
  ) => {
    console.log("!!Handle close");
    if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
      setModalOpen(false);
    }
  };
  const handleCloseNavModalModal = () => {
    console.log("!!Handle nav close");
    setIsNavModalOpen(false);
  };
  // const handleCloseModal = () => createHandleCloseModal(setModalOpen);

  // Sends scrollHeight to SquareSpace to adjust IFrame height dynamically
  React.useEffect(() => {
    const sendResizeMessage = () => {
      // Get the height of the content inside the iframe (document body's height)
      const height = document.body.scrollHeight;

      // Send the resize message to the parent window (Squarespace)
      window.parent.postMessage({ type: "resize", height: height }, "*");
    };

    // Send the message when the component mounts
    sendResizeMessage();

    // Optionally, trigger resize message on window resize
    window.addEventListener("resize", sendResizeMessage);

    // Cleanup event listener when component unmounts
    return () => {
      window.removeEventListener("resize", sendResizeMessage);
    };
  }, []);

  const isUserSignedIn = !!user?.email;
  const isUserVerified = user?.emailVerified ?? false;
  const isUserLoggedInAndNotVerified = isUserSignedIn && !isUserVerified;

  const handlePurchase = (type: "rent" | "buy") => {
    handleClosePaymentModal(); // Close modal after selection
    // TODO: Implement Stripe checkout logic
  };

  return (
    <>
      <Box
        sx={{
          width: "100%", // Inherit width naturally
          display: "grid", // Use grid to overlap text & video
          placeItems: "center", // Centers content perfectly
          overflow: "hidden",
        }}>
        {/* VIMEO PLAYER */}
        <Box
          component='iframe'
          sx={{
            width: "100%", // Fully responsive width
            aspectRatio: "18 / 9", //Magic number that makes height of container exactly the height of video player('16 / 9' is default)
            objectFit: "cover", // Ensures no extra space appears
            pointerEvents: "none",
            gridArea: "1 / 1", // Keeps video in the same grid as text
          }}
          src='https://player.vimeo.com/video/800568527?h=5f6f3af6b4&autoplay=1&loop=1&muted=1&background=1'
          frameBorder='0'
          allow='autoplay; fullscreen'
          allowFullScreen
        />

        {/* VIMEO TEXT/BUTTONS */}
        <Box
          sx={{
            gridArea: "1 / 1", // Ensures text and video overlap
            width: "100%", // Match the video's width
            maxWidth: "600px",
            padding: 4,
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            justifySelf: "flex-start",
            textAlign: "left",
            zIndex: 1, // Keeps text above the video
          }}>
          <Typography
            variant='h3'
            sx={{
              fontWeight: "bold",
              textShadow: "2px 2px 10px rgba(0,0,0,0.7)",
            }}>
            {title}
          </Typography>
          <Typography variant='subtitle1' sx={{ mb: 2 }}>
            {description}
          </Typography>

          {/* Buttons */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant='contained'
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.1)",
                color: "white",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.3)" },
              }}>
              ▶ Rent
            </Button>
            <Button
              onClick={handleOpenModal}
              variant='contained'
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.1)",
                color: "white",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" },
              }}>
              ▶ Buy
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Purchase Modal */}
      {modalOpen ? (
        <PurchaseModal
          authState={authState}
          open={modalOpen}
          handleClose={handleClosePaymentModal}
          handlePurchase={handlePurchase}
          // isUserLoggedInAndNotVerified={isUserLoggedInAndNotVerified}
          // isUserVerified={isUserVerified}
          // isUserSignedIn={isUserSignedIn}
          refetchUserData={refetchUserData}
          user={user}
          loginErrors={loginErrors}
          setLoginErrors={setLoginErrors}
        />
      ) : null}
      {isNavModalOpen ? (
        <RegisterOrLoginModal
          authState={authState}
          open={isNavModalOpen}
          handleClose={handleCloseNavModalModal}
          // isUserVerified={isUserVerified}
          // isUserLoggedInAndNotVerified={isUserLoggedInAndNotVerified}
          // isUserSignedIn={isUserSignedIn}
          loginErrors={loginErrors}
          setLoginErrors={setLoginErrors}
        />
      ) : null}
    </>
  );
};

export default Hero;
