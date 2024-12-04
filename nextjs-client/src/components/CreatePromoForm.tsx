import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPromoSchema, CreatePromoFormValues } from "@/types";
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
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

const CreatePromoForm = ({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const queryClient = useQueryClient();

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePromoFormValues>({
    resolver: zodResolver(createPromoSchema),
    defaultValues: {
      promo_name: "",
      promo_expiry: new Date(),
      promo_discount: 0,
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
    mutationFn: async (data: CreatePromoFormValues) => {
      const response = await api.post("/promos", data);
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries(["promos"]);
    },
    onSuccess: () => {
      reset();
    },
    /* eslint-disable @typescript-eslint/no-explicit-any */
    onError: (e: any) => {
      console.error(e);
    },
  });

  return (
    <Grid container justifyContent="center">
      <Grid size={{ xs: 12, sm: 8, md: 6 }}>
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h5" gutterBottom>
                Add Promo
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
            <form
              onSubmit={handleSubmit(
                async (data: CreatePromoFormValues) => await mutate(data)
              )}
            >
              <Grid container spacing={3}>
                {/* Promo Name */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="promo_name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        variant="filled"
                        fullWidth
                        label="Promo Name"
                        error={!!errors.promo_name}
                        helperText={errors.promo_name?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Promo Expiry */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    control={control}
                    name="promo_expiry"
                    rules={{ required: true }}
                    render={({ field }) => {
                      return (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label="Promo Expiry"
                            value={field.value ? dayjs(field.value) : null} // Convert to Dayjs object
                            inputRef={field.ref}
                            onChange={(date) => {
                              field.onChange(date ? date.toDate() : null);
                            }}
                            slotProps={{
                              textField: {
                                size: "small",
                                error: !!errors.promo_expiry,
                                helperText: errors.promo_expiry?.message,
                              },
                            }}
                          />
                        </LocalizationProvider>
                      );
                    }}
                  />
                </Grid>

                {/* Promo Discount */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="promo_discount"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Promo Discount"
                        type="number"
                        value={field.value || ""} // Ensure value isn't `undefined` or `null`
                        onChange={(e) =>
                          field.onChange(
                            (e.target as HTMLInputElement).valueAsNumber || 0
                          )
                        } // Convert to number
                        error={!!errors.promo_discount}
                        helperText={errors.promo_discount?.message}
                      />
                    )}
                  />
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
                    {isLoading ? <CircularProgress size={24} /> : "Add Promo"}
                  </Button>
                </Grid>

                {/* Success/Error Messages */}
                {isError && (
                  /* es-lint-disable-next-line @typescript-eslint/no-explicit-any */
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="error">
                      {(error as any)?.response?.data?.detail ||
                        "An error occurred"}
                    </Alert>
                  </Grid>
                )}
                {isSuccess && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="success">Promo added successfully!</Alert>
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

export default CreatePromoForm;
