// src/components/VimeoPlayer.tsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";

interface VimeoPlayerProps {
  videoId: string;
  width?: number | string;
  height?: number | string;
}

const VimeoPlayer: React.FC = () => {
  // Construct the Vimeo embed URL using the videoId
  // const url = `https://player.vimeo.com/video/${videoId}`;
  const url =
    "https://player.vimeo.com/video/800568527?h=5f6f3af6b4&app_id=122963";

  return (
    <Box
      component='iframe'
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: "100%",
        height: "100%",
        transform: "translate(-50%, -50%)",
        objectFit: "cover",
        zIndex: -1,
        pointerEvents: "none", // Prevents interactions with the iframe
      }}
      src={`https://player.vimeo.com/video/800568527?h=5f6f3af6b4&app_id=122963?autoplay=1&loop=1&muted=1&background=1`}
      frameBorder='0'
      allow='autoplay; fullscreen'
      allowFullScreen
    />
    // <Box
    //   component='iframe'
    //   // sx={{
    //   //   width: "100%",
    //   //   height: "100%",
    //   //   objectFit: "cover", // Ensures it fills the box properly
    //   //   zIndex: -1,
    //   //   pointerEvents: "none",
    //   // }}
    //   sx={{
    //     position: "absolute",
    //     top: "50%",
    //     left: "50%",
    //     width: "100%",
    //     height: "100%",
    //     transform: "translate(-50%, -50%)",
    //     objectFit: "cover",
    //     zIndex: -1,
    //     pointerEvents: "none", // Prevents interactions with the iframe
    //   }}
    //   // https://player.vimeo.com/video/800568527?h=5f6f3af6b4&app_id=122963
    //   // src={`https://player.vimeo.com/video/${vimeoVideoId}?autoplay=1&loop=1&muted=1&background=1`}
    // src={`https://player.vimeo.com/video/800568527?h=5f6f3af6b4&app_id=122963?autoplay=1&loop=1&muted=1&background=1`}
    // frameBorder='0'
    // allow='autoplay; fullscreen'
    // allowFullScreen
    // />
  );
};

export default VimeoPlayer;

// <div className='vimeo-player'>
//   <iframe
//     src={url}
//     width={width}
//     height={height}
//     frameBorder='0'
//     allow='autoplay; fullscreen; picture-in-picture'
//     allowFullScreen
//     title='Vimeo Player'></iframe>
// </div>

// data-html="<iframe src=&quot;https://player.vimeo.com/video/800568527?h=5f6f3af6b4&app_id=122963&quot; width=&quot;426&quot; height=&quot;214&quot; frameborder=&quot;0&quot; allow=&quot;autoplay; fullscreen; picture-in-picture&quot; allowfullscreen title=&quot;Woyane Official Trailer&quot;></iframe>
