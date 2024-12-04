import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Typography,
  Stack,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { createVenueSchema, CreateVenueFormValues } from "@/types";
import Grid from "@mui/material/Grid2";
import { useMutation, useQueryClient } from "react-query";
import api from "@/services/apiService";

const CreateVenueForm = ({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const queryClient = useQueryClient();
  const {
    control,
    reset,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateVenueFormValues>({
    resolver: zodResolver(createVenueSchema),
    defaultValues: {
      venue_name: "",
      venue_address: "",
      venue_capacity: 1,
      venue_price_per_day: 0,
      venue_image: null,
    },
  });

  const {
    mutate,
    isLoading,
    isError,
    isSuccess,
    reset: resetMutate,
    error,
  } = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post("/venues", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries(["venues"]);
    },
    onSuccess: () => {
      reset();
    },
  });

  const onSubmit = (data: CreateVenueFormValues) => {
    const formData = new FormData();
    formData.append("venue_name", data.venue_name);
    formData.append("venue_address", data.venue_address);
    formData.append("venue_capacity", data.venue_capacity.toString());
    formData.append("venue_price_per_day", data.venue_price_per_day.toString());
    if (data.venue_image) {
      formData.append("venue_image", data.venue_image);
    }
    mutate(formData);
  };

  return (
    <Grid container justifyContent="center">
      <Grid size={{ xs: 12, sm: 8, md: 6 }}>
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h5" gutterBottom>
                Add Venue
              </Typography>
              <IconButton
                onClick={() => {
                  setOpen(false);
                  resetMutate();

                  reset();
                }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                {/* Venue Name */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="venue_name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Venue Name"
                        error={!!errors.venue_name}
                        helperText={errors.venue_name?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Venue Address */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="venue_address"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Venue Address"
                        error={!!errors.venue_address}
                        helperText={errors.venue_address?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Venue Capacity */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="venue_capacity"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Venue Capacity"
                        type="number"
                        value={field.value || ""} // Ensure value isn't `undefined` or `null`
                        onChange={(e) =>
                          field.onChange(
                            (e.target as HTMLInputElement).valueAsNumber || 0
                          )
                        } // Convert to number
                        error={!!errors.venue_capacity}
                        helperText={errors.venue_capacity?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Venue Price Per Day */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="venue_price_per_day"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Price Per Day"
                        type="number"
                        value={field.value || ""} // Ensure value isn't `undefined` or `null`
                        onChange={(e) =>
                          field.onChange(
                            (e.target as HTMLInputElement).valueAsNumber || 0
                          )
                        } // Convert to number
                        error={!!errors.venue_price_per_day}
                        helperText={errors.venue_price_per_day?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Venue Image */}
                <Grid size={{ xs: 12 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setValue("venue_image", e.target.files[0]);
                      }
                    }}
                  />
                  {errors.venue_image && (
                    <Typography color="error" variant="body2">
                      {errors.venue_image.message}
                    </Typography>
                  )}
                </Grid>

                {/* Submit Button */}
                <Grid size={{ xs: 12 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isLoading}
                    fullWidth
                  >
                    {isLoading ? <CircularProgress size={24} /> : "Add Venue"}
                  </Button>
                </Grid>

                {/* Success/Error Messages */}
                {isError && (
                
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="error">
                      {(
                        error as any // eslint-disable-line @typescript-eslint/no-explicit-any
                      )?.response?.data?.detail ||
                        "An error occurred"}
                    </Alert>
                  </Grid>
                )}
                {isSuccess && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="success">Venue added successfully!</Alert>
                  </Grid>
                )}
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default CreateVenueForm;
