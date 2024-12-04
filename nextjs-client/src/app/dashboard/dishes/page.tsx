"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CircularProgress,
  Alert,
  Fab,
  Stack,
  Backdrop,
  IconButton,
  CardHeader,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { DishModel } from "@/types";
import api from "@/services/apiService";
import { useMutation, useQuery, useQueryClient } from "react-query";
import AddIcon from "@mui/icons-material/Add";
import CreateDishForm from "@/components/CreateDishForm";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

const fetchDishes = async (): Promise<DishModel[]> => {
  const { data } = await api.get("/caterings/dishes"); // Replace with your API endpoint.
  return data;
};

const Dishes = () => {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const handleOpen = () => {
    setOpen(true);
  };

  const {
    data: dishes,
    isLoading,
    isError,
  } = useQuery(["dishes"], fetchDishes, {
    onError: () => {
      console.error("Error fetching dishes");
    },
  });

  const { mutate } = useMutation({
    mutationFn: async (dish_id: string) => {
      const response = await api.delete(`/caterings/dishes/${dish_id}`);
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries(["dishes"]);
    },
  });

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Failed to fetch dishes.</Alert>;

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
        {dishes?.map((dish) => (
          <Grid size={{ xs: 2, sm: 4, md: 4 }} key={dish.dish_id}>
            <Card sx={{ height: "100%" }}>
              <CardHeader
                action={
                  <IconButton
                    onClick={async () => await mutate(dish.dish_id)}
                    aria-label="delete"
                  >
                    <DeleteForeverIcon color="error" />
                  </IconButton>
                }
                title={dish.dish_name}
              />
              {dish.dish_image && (
                <CardMedia
                  component="img"
                  alt={dish.dish_name}
                  height="140"
                  image={dish.dish_image}
                />
              )}
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {dish.dish_description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dish Type: {dish.dish_type}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cost per serving: ${dish.dish_cost_per_serving}
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
        <CreateDishForm setOpen={setOpen} />
      </Backdrop>
    </Stack>
  );
};

export default Dishes;
