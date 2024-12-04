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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { createDishSchema, CreateDishFormValues } from "@/types";
import Grid from "@mui/material/Grid2";
import { useMutation, useQueryClient } from "react-query";
import api from "@/services/apiService";

const CreateDishForm = ({
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
  } = useForm<CreateDishFormValues>({
    resolver: zodResolver(createDishSchema),
    defaultValues: {
      dish_name: "",
      dish_description: "",
      dish_type: "starter",
      dish_cost_per_serving: 0,
      dish_image: null,
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
      const response = await api.post("/caterings/dishes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries(["dishes"]);
    },
    onSuccess: () => {
      reset();
    },
  });

  const onSubmit = (data: CreateDishFormValues) => {
    const formData = new FormData();
    formData.append("dish_name", data.dish_name);
    formData.append("dish_description", data.dish_description);
    formData.append("dish_type", data.dish_type);
    formData.append(
      "dish_cost_per_serving",
      data.dish_cost_per_serving.toString()
    );
    if (data.dish_image) {
      formData.append("dish_image", data.dish_image);
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
                Add Dish
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
                {/* Dish Name */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="dish_name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Dish Name"
                        error={!!errors.dish_name}
                        helperText={errors.dish_name?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Dish Description */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="dish_description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Dish Description"
                        error={!!errors.dish_description}
                        helperText={errors.dish_description?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Dish Type */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="dish_type"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.dish_type}>
                        <InputLabel id="dish-type-label">Dish Type</InputLabel>
                        <Select
                          {...field}
                          labelId="dish-type-label"
                          id="dish-type"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          label="Dish Type"
                        >
                          <MenuItem value="starter">Starter</MenuItem>
                          <MenuItem value="main">Main</MenuItem>
                          <MenuItem value="dessert">Dessert</MenuItem>
                        </Select>
                        {errors.dish_type && (
                          <Typography color="error" variant="body2">
                            {errors.dish_type.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                {/* Dish Cost Per Serving */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="dish_cost_per_serving"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Cost Per Serving"
                        type="number"
                        value={field.value || ""} // Ensure value isn't `undefined` or `null`
                        onChange={(e) =>
                          field.onChange(
                            (e.target as HTMLInputElement).valueAsNumber || 0
                          )
                        } // Convert to number
                        error={!!errors.dish_cost_per_serving}
                        helperText={errors.dish_cost_per_serving?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Dish Image */}
                <Grid size={{ xs: 12 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setValue("dish_image", e.target.files[0]);
                      }
                    }}
                  />
                  {errors.dish_image && (
                    <Typography color="error" variant="body2">
                      {errors.dish_image.message}
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
                    {isLoading ? <CircularProgress size={24} /> : "Add Dish"}
                  </Button>
                </Grid>

                {/* Success/Error Messages */}
                {isError && (
                  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="error">
                      {(
                        error as any  // eslint-disable-line @typescript-eslint/no-explicit-any
                      )?.response?.data?.detail ||
                        "An error occurred"}
                    </Alert>
                  </Grid>
                )}
                {isSuccess && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="success">Dish added successfully!</Alert>
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

export default CreateDishForm;
