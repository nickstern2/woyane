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

const navItems = ["Home", "About", "Services", "Contact"];

const Navbar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const toggleDrawer = () => setMobileOpen((prev) => !prev);

  return (
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
            {navItems.map((item, index) => (
              <Button
                key={item}
                color='inherit'
                sx={{ mr: index === navItems.length - 1 ? 2 : 0 }} // Extra padding for the last item
              >
                {item}
              </Button>
            ))}
          </Box>
        )}

        {!isMobile && (
          <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
            <Avatar alt='Profile' src='/profile.jpg' />
          </IconButton>
        )}

        {/* Profile Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          sx={{ mt: 1 }}>
          <MenuItem onClick={handleMenuClose}>Purchase History</MenuItem>
          <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
        </Menu>

        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton edge='start' color='inherit' onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer anchor='left' open={mobileOpen} onClose={toggleDrawer}>
        <List sx={{ width: 250 }}>
          {navItems.map((item) => (
            <ListItem key={item} disablePadding>
              <ListItemButton onClick={toggleDrawer}>
                <ListItemText primary={item} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
