"use client";
import React from "react";
import {
  Card,
  CardContent,
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
import { PromoModel } from "@/types"; // Adjust import for PromoModel
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CreatePromoForm from "@/components/CreatePromoForm"; // Adjust import for CreatePromoForm

const fetchPromos = async (): Promise<PromoModel[]> => {
  const { data } = await api.get("/promos");
  return data;
};

const Promos = () => {
  const [open, setOpen] = React.useState(false);

  const queryClient = useQueryClient();
  const handleOpen = () => {
    setOpen(true);
  };

  const { mutate } = useMutation({
    mutationFn: async (promo_id: string) => {
      const response = await api.delete(`/promos/${promo_id}`);
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries(["promos"]);
    },
  });

  const {
    data: promos,
    isLoading,
    error,
  } = useQuery(["promos"], fetchPromos, {
    onError: () => {
      console.error("Error fetching promos");
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
    return <Typography color="error">Failed to load promos.</Typography>;
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
        {promos?.map((promo) => (
          <Grid size={{ xs: 2, sm: 4, md: 4 }} key={promo.promo_id}>
            <Card sx={{ height: "100%" }}>
              <CardHeader
                action={
                  <IconButton
                    onClick={async () => await mutate(promo.promo_id)}
                    aria-label="delete"
                  >
                    <DeleteForeverIcon color="error" />
                  </IconButton>
                }
                title={promo.promo_name}
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Expiry Date:{" "}
                  {new Date(promo.promo_expiry).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Discount: {promo.promo_discount}%
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
        <CreatePromoForm setOpen={setOpen} />
      </Backdrop>
    </Stack>
  );
};

export default Promos;
