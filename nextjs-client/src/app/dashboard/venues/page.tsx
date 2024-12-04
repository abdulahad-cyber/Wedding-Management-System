"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Rating,
  CircularProgress,
  Alert,
  Fab,
  Stack,
  Backdrop,
  IconButton,
  CardHeader,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Venue } from "@/types";
import api from "@/services/apiService";
import { useMutation, useQuery, useQueryClient } from "react-query";
import AddIcon from "@mui/icons-material/Add";
import CreateVenueForm from "@/components/CreateVenueForm";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

const fetchVenues = async (): Promise<Venue[]> => {
  const { data } = await api.get("/venues"); // Replace with your API endpoint.
  return data;
};

const Venues = () => {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const handleOpen = () => {
    setOpen(true);
  };

  const {
    data: venues,
    isLoading,
    isError,
  } = useQuery(["venues"], fetchVenues, {
    onError: () => {
      console.error("Error fetching venues");
    },
  });

  const { mutate } = useMutation({
    mutationFn: async (venue_id: string) => {
      const response = await api.delete(`/venues/${venue_id}`);
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries(["venues"]);
    },
  });

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Failed to fetch venues.</Alert>;

  return (
    <Stack
      direction="column"
      justifyContent={"space-between"}
      flexGrow={1}
      spacing={2}
      sx={{
        p: 2,
        justifySelf: "stretch",
      }}
    >
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 2, sm: 8, md: 12 }}
        alignItems={"stretch"}
      >
        {venues?.map((venue) => {
          // Calculate average rating
          const totalRatings = venue.venue_reviews.reduce(
            (acc, review) => acc + review.venue_rating,
            0
          );
          const averageRating = venue.venue_reviews.length
            ? Math.round(totalRatings / venue.venue_reviews.length)
            : 0;

          return (
            <Grid size={{ xs: 2, sm: 4, md: 4 }} key={venue.venue_id}>
              <Card sx={{ height: "100%" }}>
                <CardHeader
                  action={
                    <IconButton
                      onClick={async () => await mutate(venue.venue_id)}
                      aria-label="delete"
                    >
                      <DeleteForeverIcon color="error" />
                    </IconButton>
                  }
                  title={venue.venue_name}
                />
                {venue.venue_image && (
                  <CardMedia
                    component="img"
                    alt={venue.venue_name}
                    height="140"
                    image={venue.venue_image}
                  />
                )}
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    location: {venue.venue_address}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    venue capacity: {venue.venue_capacity}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    venue price per day: {venue.venue_price_per_day}
                  </Typography>
                  <Box mt={2}>
                    {averageRating > 0 ? (
                      <Rating value={averageRating} readOnly />
                    ) : (
                      "No ratings yet"
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      <Fab
        color="primary"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
        }}
        size="medium"
        onClick={handleOpen}
        aria-label="add"
      >
        <AddIcon />
      </Fab>
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={open}
      >
        <CreateVenueForm setOpen={setOpen} />
      </Backdrop>
    </Stack>
  );
};

export default Venues;
