import React, { useState } from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import VimeoPlayer from "./VimeoPlayer";
import PurchaseModal from "./PurchaseModal";
import { useAuth } from "../providers/useAuth";
import { description, title } from "../utils/consts";
import { RegisterOrLoginModal } from "./RegisterOrLoginModal";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import Player from "@vimeo/player";

type HeroProps = {
  isNavModalOpen: boolean;
  setIsNavModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Hero: React.FC<HeroProps> = ({ isNavModalOpen, setIsNavModalOpen }) => {
  const { user, authState, refetchUserData } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [loginErrors, setLoginErrors] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const vimeoPlayerRef = React.useRef<Player | null>(null);

  // Ensures video is muted at initial load
  React.useEffect(() => {
    const iframe = document.getElementById("vimeo-player") as HTMLIFrameElement;
    if (iframe && !vimeoPlayerRef.current) {
      // Ensures the player is initialized only once
      const player = new Player(iframe);
      vimeoPlayerRef.current = player;

      player.ready().then(() => {
        player.setMuted(true);
      });
    }
  }, []);

  const toggleMute = async () => {
    if (vimeoPlayerRef.current) {
      const newMutedState = !isMuted;
      await vimeoPlayerRef.current.setMuted(newMutedState);
      setIsMuted(newMutedState);
    }
  };

  const handleOpenModal = () => setModalOpen(true);

  const handleClosePaymentModal = (
    reason?: "backdropClick" | "escapeKeyDown"
  ) => {
    if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
      setModalOpen(false);
    }
  };
  const handleCloseNavModalModal = () => {
    setIsNavModalOpen(false);
  };

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

  const handlePurchase = (type: "rent" | "buy") => {
    handleClosePaymentModal(); // Close modal after selection
    // TODO: Implement Stripe checkout logic
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
        }}>
        {/* Background Video */}
        <Box
          id='vimeo-player'
          component='iframe'
          sx={{
            width: "100%",
            aspectRatio: "18 / 9",
            objectFit: "cover",
            pointerEvents: "none",
            gridArea: "1 / 1", // Keeps video as the background
          }}
          src='https://player.vimeo.com/video/800568527?h=5f6f3af6b4&autoplay=1&loop=1&background=1'
          frameBorder='0'
          allow='autoplay; fullscreen'
          allowFullScreen
        />

        {/* Content Wrapper (Text + Mute Button) */}
        <Box
          sx={{
            gridArea: "1 / 1",
            width: "100%",
            height: "100%",
            display: "grid",
            gridTemplateColumns: "1fr auto", // Text takes most space, mute button stays small
            alignItems: "center",
            padding: 4,
          }}>
          {/* Box 2: Text & Buttons (Aligned Left) */}
          <Box
            sx={{
              maxWidth: "600px",
              color: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              textAlign: "left",
              justifySelf: "start", // Ensures it stays on the left
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

          {/* Box 3: Mute Button (Aligned Right) */}
          <IconButton
            onClick={toggleMute}
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "white",
              justifySelf: "end", // Ensures it stays on the right
              alignSelf: "end", // Ensures it stays on the bottom
              "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.8)" },
            }}>
            {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>
        </Box>
      </Box>
      {modalOpen ? (
        <PurchaseModal
          authState={authState}
          open={modalOpen}
          handleClose={handleClosePaymentModal}
          handlePurchase={handlePurchase}
          refetchUserData={refetchUserData} //TODO: think can be removed unless manual query works
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
          loginErrors={loginErrors}
          setLoginErrors={setLoginErrors}
        />
      ) : null}
    </>
  );
};

export default Hero;
