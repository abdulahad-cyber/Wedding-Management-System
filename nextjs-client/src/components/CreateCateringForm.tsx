import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCateringSchema, CreateCateringFormValues } from "@/types";
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

const CreateCateringForm = ({
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
  } = useForm<CreateCateringFormValues>({
    resolver: zodResolver(createCateringSchema),
    defaultValues: {
      catering_name: "",
      catering_description: "",
      catering_image: null,
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
      const response = await api.post("/caterings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries(["caterings"]);
    },
    onSuccess: () => {
      reset();
    },
  });

  const onSubmit = (data: CreateCateringFormValues) => {
    const formData = new FormData();
    formData.append("catering_name", data.catering_name);
    formData.append("catering_description", data.catering_description);
    if (data.catering_image) {
      formData.append("catering_image", data.catering_image);
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
                Add Catering
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
                {/* Catering Name */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="catering_name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Catering Name"
                        error={!!errors.catering_name}
                        helperText={errors.catering_name?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Catering Description */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="catering_description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Catering Description"
                        multiline
                        rows={4}
                        error={!!errors.catering_description}
                        helperText={errors.catering_description?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Catering Image */}
                <Grid size={{ xs: 12 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setValue("catering_image", e.target.files[0]);
                      }
                    }}
                  />
                  {errors.catering_image && (
                    <Typography color="error" variant="body2">
                      {errors.catering_image.message}
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
                      "Add Catering"
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
                      Catering added successfully!
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

export default CreateCateringForm;
