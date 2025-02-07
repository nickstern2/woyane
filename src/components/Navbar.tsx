import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../providers/useAuth";
import { logOut } from "../utils/auth-utils";
import { RegisterOrLoginModal } from "./RegisterOrLoginModal";

// const navItems = ["Home", "About", "Services", "Contact"];
const navItems = [
  { label: "Home", id: "home-section" },
  { label: "About", id: "about-section" },
  { label: "Services", id: "services-section" },
  { label: "Contact", id: "contact-section" },
];

const handleScroll = (id: string) => {
  const section = document.getElementById(id);
  if (section) {
    console.log("!!Scroll");
    section.scrollIntoView({ behavior: "smooth" });
    window.history.pushState(null, "", `#${id}`); // Optional: Update URL
  }
};

type NavBarProps = {
  setIsNavModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Navbar: React.FC<NavBarProps> = ({ setIsNavModalOpen }) => {
  const { user } = useAuth();
  // const { user, loading, userData, refetchUserData } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // const [modalOpen, setModalOpen] = useState(false);

  // const handleCloseModal = () => {
  //   console.log("!!Handle close modal");
  //   setIsNavModalOpen(false);
  // };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    logOut();
    // Close toggle
    handleMenuClose();
  };

  // const toggleDrawer = () => setModalOpen((prev) => !prev);

  console.log("!user", user);
  const isUserSignedIn = !!user?.email;
  const isUserVerified = user?.emailVerified ?? false;
  const userNeedsVerification = isUserSignedIn && !isUserVerified;
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
          {/* Logo or Brand */}
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

          {/* //TODO: think top half is broken  */}
          {!isMobile &&
            (isUserSignedIn ? (
              <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                {/* <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}> */}
                <Avatar alt='Profile' src='/profile.jpg' />
              </IconButton>
            ) : (
              <Button
                variant='contained'
                onClick={() => setIsNavModalOpen(true)}
                sx={{ mt: 2 }}>
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

        {/* Mobile Drawer */}
        {/* <Drawer anchor='left' open={mobileOpen} onClose={handleMenuOpen}>
          <List sx={{ width: 250 }}>
            {navItems.map((item) => (
            <ListItem key={item} disablePadding>
              <ListItemButton onClick={toggleDrawer}>
                <ListItemText primary={item} />
              </ListItemButton>
            </ListItem>
          ))}
          </List>
        </Drawer> */}
      </AppBar>
    </>
  );
};

export default Navbar;
