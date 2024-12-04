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
  Tooltip,
  Paper,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Grid from "@mui/material/Grid2";
import api from "@/services/apiService";
import { CateringModel, DishModel } from "@/types"; // Update import to CateringModel
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CreateCateringForm from "@/components/CreateCateringForm"; // Update to create catering form
import { useMutation, useQuery, useQueryClient } from "react-query";
import RestaurantIcon from "@mui/icons-material/Restaurant";

const fetchCaterings = async (): Promise<CateringModel[]> => {
  const { data } = await api.get("/caterings"); // Update endpoint to caterings
  return data;
};

const Caterings = () => {
  const [open, setOpen] = React.useState(false);
  const [dishes, setDishes] = React.useState<DishModel[]>([]);
  const [dishesOpen, setDishesOpen] = React.useState(false);
  const handleDishesClose = () => {
    setDishesOpen(false);
  };
  const handleDishesOpen = async () => {
    setDishesOpen(true);
    const { data } = await api.get("/caterings/dishes"); // Update endpoint to caterings
    setDishes(data);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: async (catering_id: string) => {
      // Update to use catering_id
      const response = await api.delete(`/caterings/${catering_id}`); // Update endpoint to caterings
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries(["caterings"]);
    },
  });

  const {
    data: caterings,
    isLoading,
    error,
  } = useQuery(["caterings"], fetchCaterings, {
    onError: () => {
      console.error("Error fetching caterings");
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
    return <Typography color="error">Failed to load caterings.</Typography>;
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
        {caterings?.map((catering) => (
          <>
            <Grid size={{ xs: 2, sm: 4, md: 4 }} key={catering.catering_id}>
              <Card sx={{ height: "100%" }}>
                <CardHeader
                  action={
                    <>
                      <Tooltip title="Manage dishes">
                        <IconButton
                          sx={{ mx: 1 }}
                          onClick={handleDishesOpen} // Update to catering_id
                          aria-label="delete"
                        >
                          <RestaurantIcon />
                        </IconButton>
                      </Tooltip>

                      <IconButton
                        onClick={async () => await mutate(catering.catering_id)} // Update to catering_id
                        aria-label="delete"
                      >
                        <DeleteForeverIcon color="error" />
                      </IconButton>
                    </>
                  }
                  title={catering.catering_name} // Show catering name
                />
                {catering.catering_image && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={catering.catering_image}
                    alt={catering.catering_name}
                  />
                )}
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {catering.catering_description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Backdrop
              sx={(theme) => ({
                color: "#fff",
                zIndex: theme.zIndex.drawer + 1,
              })}
              open={dishesOpen}
              onClick={handleDishesClose}
            >
              <Paper
                elevation={3}
                sx={{ p: 3 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Typography variant="h5">Select Dishes</Typography>
                <FormGroup>
                  {dishes.map((dish) => {
                    return (
                      <FormControlLabel
                        key={dish.dish_id}
                        control={
                          <Checkbox
                            defaultChecked={
                              catering.catering_menu_items.find(
                                (menuItem) => menuItem.dish_id === dish.dish_id
                              ) !== undefined
                            }
                            onChange={async (e) => {
                              if (e.target.checked) {
                                await api.post(
                                  `/caterings/${catering.catering_id}/dishes/${dish.dish_id}`
                                );
                              } else {
                                await api.delete(
                                  `/caterings/${catering.catering_id}/dishes/${dish.dish_id}`
                                );
                              }
                              queryClient.invalidateQueries(["caterings"]);
                            }}
                          />
                        }
                        label={dish.dish_name}
                      />
                    );
                  })}
                </FormGroup>
              </Paper>
            </Backdrop>
          </>
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
        <CreateCateringForm setOpen={setOpen} />
      </Backdrop>
    </Stack>
  );
};

export default Caterings;
