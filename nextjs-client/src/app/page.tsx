"use client";
import AvatarProfile from "@/components/AvatarProfile";
import CarsCarousel from "@/components/CarsCarousel";
import CateringCarousel from "@/components/CateringCarousel";
import DecorationCarousel from "@/components/DecorationCarousel";
import DishCarousel from "@/components/DishesCarousel";
import PageLoader from "@/components/PageLoader";
import VenueCarousel from "@/components/VenueCarousel";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
  AppBar,
  Box,
  Button,
  Chip,
  Stack,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";

const HomePage = () => {
  const { loading } = useAuthGuard();
  const theme = useTheme();
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
              label="User"
            />
          </Typography>
          <Stack gap={2} direction="row">
            <Button sx={{ py: 0 }} size="small" variant="contained">
              <a href="/bookings">Bookings</a>
            </Button>

            <AvatarProfile />
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          p: 2,
          bgcolor: theme.palette.background.default,
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        <VenueCarousel />
        <CateringCarousel />
        <DecorationCarousel />
        <CarsCarousel />
        <DishCarousel />
      </Box>
    </Box>
  );
};

export default HomePage;
