import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import VimeoPlayer from "./VimeoPlayer";
import PurchaseModal from "./PurchaseModal";
import { useAuth } from "../hooks/useAuth";
import { description, title } from "../utils/consts";

const Hero: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);

  const handleCloseModal = (reason?: "backdropClick" | "escapeKeyDown") => {
    if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
      setModalOpen(false);
    }
  };

  const { user, loading, userData, refetchUserData } = useAuth();
  const isUserSignedIn = !!user?.email;
  const isUserVerified = user?.emailVerified ?? false;
  const userNeedsVerification = isUserSignedIn && !isUserVerified;

  const handlePurchase = (type: "rent" | "buy") => {
    handleCloseModal(); // Close modal after selection
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
        {/* Background Vimeo Video (Fully Dynamic) */}
        <Box
          component='iframe'
          sx={{
            width: "100%", // Fully responsive width
            aspectRatio: "17.8 / 9", //Magic number that makes height of container exactly the height of video player.
            // aspectRatio: "16 / 9", // Keeps proper video proportions
            objectFit: "cover", // Ensures no extra space appears
            pointerEvents: "none", // Prevents interaction with the iframe
            gridArea: "1 / 1", // Keeps video in the same grid as text
          }}
          src='https://player.vimeo.com/video/800568527?h=5f6f3af6b4&autoplay=1&loop=1&muted=1&background=1'
          frameBorder='0'
          allow='autoplay; fullscreen'
          allowFullScreen
        />

        {/* Overlay Content (Perfectly Centered Over Video) */}
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
          open={modalOpen}
          handleClose={handleCloseModal}
          handlePurchase={handlePurchase}
          userNeedsVerification={userNeedsVerification}
          isUserVerified={isUserVerified}
          isUserSignedIn={isUserSignedIn}
          refetchUserData={refetchUserData}
          user={user}
        />
      ) : null}
    </>
  );
};

export default Hero;
