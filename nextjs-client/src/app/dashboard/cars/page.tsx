"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CircularProgress,
  Box,
  CardHeader,
  IconButton,
  Fab,
  Backdrop,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import Grid from "@mui/material/Grid2";
import api from "@/services/apiService";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { CarModel } from "@/types";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CreateCarForm from "@/components/CreateCarForm";

const fetchCars = async (): Promise<CarModel[]> => {
  const { data } = await api.get("/cars");
  return data;
};

const Cars = () => {
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: async (venue_id: string) => {
      const response = await api.delete(`/cars/${venue_id}`);
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries(["cars"]);
    },
  });
  const {
    data: cars,
    isLoading,
    error,
  } = useQuery(["cars"], fetchCars, {
    onError: () => {
      console.error("Error fetching cars");
    },
  });
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">Failed to load cars.</Typography>;
  }

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
      >
        {cars?.map((car) => (
          <Grid size={{ xs: 2, sm: 4, md: 4 }} key={car.car_id}>
            <Card sx={{ height: "100%" }}>
              <CardHeader
                action={
                  <IconButton
                    onClick={async () => await mutate(car.car_id)}
                    aria-label="delete"
                  >
                    <DeleteForeverIcon color="error" />
                  </IconButton>
                }
                title={car.car_make + " " + car.car_model + " " + car.car_year}
              />
              {car.car_image && (
                <CardMedia
                  component="img"
                  height="140"
                  image={car.car_image}
                  alt={`${car.car_make} ${car.car_model}`}
                />
              )}
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Rental Price: ${car.car_rental_price} / day
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quantity Available: {car.car_quantity}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
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
        <CreateCarForm setOpen={setOpen} />
      </Backdrop>
    </Stack>
  );
};

export default Cars;
