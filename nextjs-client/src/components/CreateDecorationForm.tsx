"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDecorationSchema, CreateDecorationFormValues } from "@/types";
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
import Grid from "@mui/material/Grid2";
import CloseIcon from "@mui/icons-material/Close";
import api from "@/services/apiService";

const CreateDecorationForm = ({
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
  } = useForm<CreateDecorationFormValues>({
    resolver: zodResolver(createDecorationSchema),
    defaultValues: {
      decoration_name: "",
      decoration_price: 0,
      decoration_description: "",
      decoration_image: null,
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
      const response = await api.post("/decorations", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries(["decorations"]);
    },
    onSuccess: () => {
      reset();
    },
  });

  const onSubmit = (data: CreateDecorationFormValues) => {
    const formData = new FormData();
    formData.append("decoration_name", data.decoration_name);
    formData.append("decoration_price", data.decoration_price.toString());
    formData.append("decoration_description", data.decoration_description);
    if (data.decoration_image) {
      formData.append("decoration_image", data.decoration_image);
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
                Add Decoration
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
                {/* Decoration Name */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="decoration_name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Decoration Name"
                        error={!!errors.decoration_name}
                        helperText={errors.decoration_name?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Decoration Price */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="decoration_price"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Price"
                        type="number"
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            (e.target as HTMLInputElement).valueAsNumber || 0
                          )
                        }
                        error={!!errors.decoration_price}
                        helperText={errors.decoration_price?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Decoration Description */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="decoration_description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Description"
                        multiline
                        minRows={3}
                        error={!!errors.decoration_description}
                        helperText={errors.decoration_description?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Decoration Image */}
                <Grid size={{ xs: 12 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setValue("decoration_image", e.target.files[0]);
                      }
                    }}
                  />
                  {errors.decoration_image && (
                    <Typography color="error" variant="body2">
                      {errors.decoration_image.message}
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
                    {isLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Add Decoration"
                    )}
                  </Button>
                </Grid>

                {/* Success/Error Messages */}
                {isError && (
            
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
                    <Alert severity="success">
                      Decoration added successfully!
                    </Alert>
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

export default CreateDecorationForm;
