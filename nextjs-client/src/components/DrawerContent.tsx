"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ChairIcon from "@mui/icons-material/Chair";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import { useMutation } from "react-query";
import { logout } from "@/services/apiService";
import { useAuthStore } from "@/stores/authStore";
import LogoutIcon from "@mui/icons-material/Logout";

const DrawerContent = ({
  setMobileOpen,
}: {
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const pathname = usePathname(); // Get the current path
  const setUser = useAuthStore((state) => state.setUser);

  const router = useRouter();
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      setUser(null);
      router.push("/auth/login");
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Menu items with corresponding routes
  const menuItems = [
    { text: "Overview", icon: <DashboardIcon />, path: "/dashboard" },
    {
      text: "Bookings",
      icon: <BookmarkBorderIcon />,
      path: "/dashboard/bookings",
    },
    { text: "Venues", icon: <LocationOnIcon />, path: "/dashboard/venues" },
    {
      text: "Caterings",
      icon: <LocalDiningIcon />,
      path: "/dashboard/caterings",
    },
    { text: "Dishes", icon: <FastfoodIcon />, path: "/dashboard/dishes" },
    {
      text: "Wedding Cars",
      icon: <DirectionsCarIcon />,
      path: "/dashboard/cars",
    },
    {
      text: "Decorations",
      icon: <ChairIcon />,
      path: "/dashboard/decorations",
    },
    {
      text: "Promo Codes",
      icon: <LocalOfferIcon />,
      path: "/dashboard/promos",
    },
    // { text: "Logout", icon: <LogoutIcon />, path: "/logout" },
  ];
  const handleListItemClick = () => {
    setMobileOpen(false);
    router.push(pathname);
  };

  return (
    <Box sx={{ width: "100%", bgcolor: "background.paper", height: "100%" }}>
      <List component="nav" aria-label="main menu">
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            href={item.path} // Use Next.js `Link` for navigation
            selected={pathname === item.path} // Highlight if the current path matches
            sx={{
              color: pathname === item.path ? "primary.main" : "inherit",
            }}
            onClick={handleListItemClick}
          >
            <ListItemIcon
              sx={{
                color: pathname === item.path ? "primary.main" : "inherit",
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
        <Divider />
        <ListItemButton onClick={async () => await logoutMutation.mutate()}>
          <ListItemIcon
            sx={{
              color: "inherit",
            }}
          >
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary={"Logout"} />
        </ListItemButton>
        <Divider />
      </List>
    </Box>
  );
};

export default DrawerContent;
