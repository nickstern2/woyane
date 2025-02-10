import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Box,
  Button,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../providers/useAuth";
import { logOut, UserAuthState } from "../utils/auth-utils";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

// Set the section id in SS to to match these ids
const navItems = [
  { label: "Home", id: "home-section" },
  { label: "About", id: "about-section" },
  // { label: "Services", id: "services-section" },//TODO: No services info on the site yet
  { label: "Team", id: "team-section" },
  { label: "Contact", id: "contact-section" },
];

const handleScroll = (id: string) => {
  // Sends scroll ID to front-end
  window.parent.postMessage({ type: "scrollToSection", sectionId: id }, "*");
};

type NavBarProps = {
  setIsNavModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Navbar: React.FC<NavBarProps> = ({ setIsNavModalOpen }) => {
  const { authState } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    logOut();
    handleMenuClose();
  };

  return (
    <>
      <AppBar
        id='react-navbar'
        className='react-navbar'
        position='relative'
        sx={{
          background: "#000000",
          boxShadow: "none",
        }}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          {/* //TODO: Logo or Font to match SS */}
          <Typography variant='h6' component='div' sx={{ fontWeight: "bold" }}>
            Woyane
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
              {navItems.map(({ label, id }, index) => (
                <Button
                  key={id}
                  color='inherit'
                  sx={{ mr: index === navItems.length - 1 ? 2 : 0 }} // Extra padding for the last item
                  onClick={() => handleScroll(id)}>
                  {label}
                </Button>
              ))}
            </Box>
          )}

          {!isMobile &&
            // If user is signed in
            (authState !== UserAuthState.NOT_SIGNED_IN ? (
              <IconButton
                onClick={handleMenuOpen}
                sx={{ color: "white", p: 0 }}>
                <AccountCircleIcon fontSize='large' />
              </IconButton>
            ) : (
              <Button
                sx={{
                  backgroundColor: "transparent", // Removes solid background
                  color: "white", // Matches navbar text color
                  border: "2px solid white", // Adds an outline for visibility
                  padding: "6px 12px", // Adjust padding to match navbar size
                  borderRadius: "4px",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.2)", // Slight hover effect
                  },
                }}
                onClick={() => setIsNavModalOpen(true)}>
                {"Log In"}
              </Button>
            ))}

          {/* Profile Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            sx={{ mt: 1 }}>
            <MenuItem onClick={handleMenuClose}>Purchase History</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton edge='start' color='inherit' onClick={handleMenuOpen}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Navbar;
