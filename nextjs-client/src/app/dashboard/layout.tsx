"use client";
import React, { useState } from "react";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
  Chip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DrawerContent from "@/components/DrawerContent";
import AvatarProfile from "@/components/AvatarProfile";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import PageLoader from "@/components/PageLoader";
import { usePathname } from "next/navigation";

const URLmappings: { [key: string]: string } = {
  dashboard: "Overview",
  bookings: "Bookings",
  venues: "Venues",
  cars: "Cars",
  caterings: "Caterings",
  dishes: "Dishes",
  promos: "Promos",
  decorations: "Decorations",
};

const drawerWidth = 240;

const Dashboard = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const lastSegment: string = pathname.split("/").filter(Boolean).pop() || ""; // Extract the last segment

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const { loading } = useAuthGuard();
  return loading ? (
    <PageLoader />
  ) : (
    <Box sx={{ display: "flex" }}>
      {/* Navbar */}
      <AppBar
        position="fixed"
        sx={{ zIndex: theme.zIndex.drawer + 1, bgcolor: "background.paper" }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              size="small"
              color="inherit"
              onClick={handleDrawerToggle}
            >
              <MenuIcon color="primary" />
            </IconButton>
          )}
          <Typography
            color="primary"
            variant="logo"
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              p: 1,
              fontSize: "1.5rem",
            }}
          >
            SHAADI.COM
            <Chip
              sx={{ ml: 2 }}
              color="primary"
              variant="filled"
              label="Admin"
            />
          </Typography>
          <AvatarProfile />
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={!isMobile || mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            py: 10,
          },
        }}
      >
        <DrawerContent setMobileOpen={setMobileOpen} />
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          px: 2,
          ml: isMobile ? 0 : `${drawerWidth}px`,
          bgcolor: theme.palette.background.default,
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ my: 2 }}>
          <Typography color="inherit">Dashboard</Typography>

          <Typography sx={{ color: "text.primary" }}>
            {URLmappings[lastSegment].charAt(0).toUpperCase() +
              URLmappings[lastSegment].slice(1)}
          </Typography>
        </Breadcrumbs>
        {children}
      </Box>
    </Box>
  );
};

export default Dashboard;
