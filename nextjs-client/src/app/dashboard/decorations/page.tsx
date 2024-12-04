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
import { DecorationModel } from "@/types";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CreateDecorationForm from "@/components/CreateDecorationForm";

const fetchDecorations = async (): Promise<DecorationModel[]> => {
  const { data } = await api.get("/decorations");
  return data;
};

const Decorations = () => {
  const [open, setOpen] = React.useState(false);

  const queryClient = useQueryClient();
  const handleOpen = () => {
    setOpen(true);
  };

  const { mutate } = useMutation({
    mutationFn: async (decoration_id: string) => {
      const response = await api.delete(`/decorations/${decoration_id}`);
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries(["decorations"]);
    },
  });

  const {
    data: decorations,
    isLoading,
    error,
  } = useQuery(["decorations"], fetchDecorations, {
    onError: ( ) => {
      console.error("Error fetching decorations");
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
    return <Typography color="error">Failed to load decorations.</Typography>;
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
        {decorations?.map((decoration) => (
          <Grid size={{ xs: 2, sm: 4, md: 4 }} key={decoration.decoration_id}>
            <Card sx={{ height: "100%" }}>
              <CardHeader
                action={
                  <IconButton
                    onClick={async () => await mutate(decoration.decoration_id)}
                    aria-label="delete"
                  >
                    <DeleteForeverIcon color="error" />
                  </IconButton>
                }
                title={decoration.decoration_name}
              />
              {decoration.decoration_image && (
                <CardMedia
                  component="img"
                  height="140"
                  image={decoration.decoration_image}
                  alt={decoration.decoration_name}
                />
              )}
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Price: ${decoration.decoration_price}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {decoration.decoration_description}
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
        <CreateDecorationForm setOpen={setOpen} />
      </Backdrop>
    </Stack>
  );
};

export default Decorations;
