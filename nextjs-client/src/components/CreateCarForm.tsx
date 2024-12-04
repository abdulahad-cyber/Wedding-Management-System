import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCarSchema, CreateCarFormValues } from "@/types";
import { useMutation, useQueryClient } from "react-query";
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
import api from "@/services/apiService";
import Grid from "@mui/material/Grid2";
import CloseIcon from "@mui/icons-material/Close";

const CreateCarForm = ({
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
  } = useForm<CreateCarFormValues>({
    resolver: zodResolver(createCarSchema),
    defaultValues: {
      car_make: "",
      car_model: "",
      car_year: 1886,
      car_rental_price: 0,
      car_quantity: 0,
      car_image: null,
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
      const response = await api.post("/cars", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries(["cars"]);
    },
    onSuccess: () => {
      reset();
    },
  });

  const onSubmit = (data: CreateCarFormValues) => {
    const formData = new FormData();
    formData.append("car_make", data.car_make);
    formData.append("car_model", data.car_model);
    formData.append("car_year", data.car_year.toString());
    formData.append("car_rental_price", data.car_rental_price.toString());
    formData.append("car_quantity", data.car_quantity.toString());
    if (data.car_image) {
      formData.append("car_image", data.car_image);
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
                Add Car
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
                {/* Car Make */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="car_make"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Car Make"
                        error={!!errors.car_make}
                        helperText={errors.car_make?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Car Model */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="car_model"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Car Model"
                        error={!!errors.car_model}
                        helperText={errors.car_model?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Car Year */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="car_year"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Car Year (1886 - Current Year)"
                        type="number"
                        value={field.value || ""} // Ensure value isn't `undefined` or `null`
                        onChange={(e) =>
                          field.onChange(
                            (e.target as HTMLInputElement).valueAsNumber || 0
                          )
                        } // Convert to number
                        error={!!errors.car_year}
                        helperText={errors.car_year?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Car Rental Price */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="car_rental_price"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Rental Price"
                        type="number"
                        value={field.value || ""} // Ensure value isn't `undefined` or `null`
                        onChange={(e) =>
                          field.onChange(
                            (e.target as HTMLInputElement).valueAsNumber || 0
                          )
                        } // Convert to number
                        error={!!errors.car_rental_price}
                        helperText={errors.car_rental_price?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Car Quantity */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="car_quantity"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Car Quantity"
                        type="number"
                        value={field.value || ""} // Ensure value isn't `undefined` or `null`
                        onChange={(e) =>
                          field.onChange(
                            (e.target as HTMLInputElement).valueAsNumber || 0
                          )
                        } // Convert to number
                        error={!!errors.car_quantity}
                        helperText={errors.car_quantity?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Car Image */}
                <Grid size={{ xs: 12 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setValue("car_image", e.target.files[0]);
                      }
                    }}
                  />
                  {errors.car_image && (
                    <Typography color="error" variant="body2">
                      {errors.car_image.message}
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
                    {isLoading ? <CircularProgress size={24} /> : "Add Car"}
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
                    <Alert severity="success">Car added successfully!</Alert>
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

export default CreateCarForm;
