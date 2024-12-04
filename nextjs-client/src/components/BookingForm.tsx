import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserBookingSchema,
  CreateUserBookingFormValues,
  CateringModel,
  PromoModel,
  CarModel,
  DecorationModel,
  Venue,
  DishModel,
  BookingModel,
} from "@/types";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ListItem,
  ListItemText,
  List,
  Chip,
  FormControlLabel,
  RadioGroup,
  Radio,
} from "@mui/material";
import api from "@/services/apiService";
import Grid from "@mui/material/Grid2";
import CloseIcon from "@mui/icons-material/Close";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useAuthStore } from "@/stores/authStore";

const BookingForm = ({
  setOpen,
  loyaltyDiscount,
  bookingID,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  loyaltyDiscount: number;
  bookingID: string | null;
}) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [venues, setVenues] = useState<Venue[]>([]);
  const [caterings, setCaterings] = useState<CateringModel[]>([]);
  const [decorations, setDecorations] = useState<DecorationModel[]>([]);
  const [promos, setPromos] = useState<PromoModel[]>([]);
  const [cars, setCars] = useState<CarModel[]>([]);
  const [booking, setBooking] = useState<BookingModel | null>(null);
  const [dishesMappings, setDishesMappings] = useState<
    { catering_id: string; dishes: DishModel[] }[]
  >([]);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [costAfterDiscount, setCostAfterDiscount] = useState<number>(0);

  const fetchData = async (endpoint: string) => {
    const response = await api.get(endpoint);
    return response.data;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          venuesData,
          cateringsData,
          decorationsData,
          promosData,
          carsData,
        ] = await Promise.all([
          fetchData("/venues"),
          fetchData("/caterings"),
          fetchData("/decorations"),
          fetchData("/promos"),
          fetchData("/cars"),
        ]);
        setVenues(venuesData);
        setCaterings(cateringsData);
        setDecorations(decorationsData);
        setPromos(promosData);
        setCars(carsData);
        if (bookingID) {
          const bookingData: BookingModel = await fetchData(
            "/bookings/" + bookingID
          );
          setValue("booking_guest_count", bookingData.booking_guest_count);
          setValue(
            "booking_event_date",
            new Date(bookingData.booking_event_date)
          );
          setValue("user_id", bookingData.user.user_id);
          setValue("venue_id", bookingData.venue.venue_id);
          setValue("catering_id", bookingData.catering?.catering_id);
          setValue("decoration_id", bookingData.decoration?.decoration_id);
          setValue("promo_id", bookingData.promo?.promo_id);
          setValue("payment_method", bookingData.payment.payment_method);
          setValue(
            "car_ids",
            bookingData.car_reservations.map((r) => r.car_id)
          );
          setBooking(bookingData);
          return bookingData;
        }
        const dishesMappings = await Promise.all(
          cateringsData.map(async (catering: CateringModel) => {
            return {
              catering_id: catering.catering_id,
              dishes: await fetchData(`/caterings/dishes`),
            };
          })
        );
        setDishesMappings(dishesMappings);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, []);

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    watch,
  } = useForm<CreateUserBookingFormValues>({
    resolver: zodResolver(createUserBookingSchema),
    defaultValues: {
      booking_event_date: new Date(),
      booking_guest_count: 1,
      user_id: user?.user_id || "", // Default user ID
      venue_id: "",
      catering_id: "",
      decoration_id: "",
      promo_id: "",
      car_ids: [],
      payment_method: "debit_card",
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
    mutationFn: async (data: CreateUserBookingFormValues) => {
      const { car_ids, payment_method, ...rest } = data;
      const filteredObject = Object.fromEntries(
        Object.entries(rest).filter(([, value]) => value !== "")
      );
      const body = {
        booking: filteredObject,
        payment: {
          payment_method: payment_method,
          total_amount: totalCost,
          discount: discountPercentage,
          amount_payed: costAfterDiscount,
        },
      };
      const response = bookingID
        ? await api.patch("/bookings/" + bookingID, body)
        : await api.post("/bookings", body);

      console.log("sending data: ", response.data);
      //delete old car reservations
      booking?.car_reservations.forEach(async (reservation) => {
        await api.delete(
          `/cars/reservations/${reservation.car_reservation_id}`
        );
      });
      //add new car reservations
      car_ids.forEach(async (car_id) => {
        await api.post(`/cars/${car_id}/${response.data.booking_id}`);
      });
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries(["bookings", "me"]);
    },
    onSuccess: () => {
      if (bookingID) setOpen(false);
    },
    /* eslint-disable @typescript-eslint/no-explicit-any */
    onError: (e: any) => {
      console.error(e);
    },
  });

  const calculateTotalCost = () => {
    const venuePrice =
      venues.find((v) => v.venue_id === getValues("venue_id"))
        ?.venue_price_per_day || 0;
    const decorationPrice =
      decorations.find((d) => d.decoration_id === getValues("decoration_id"))
        ?.decoration_price || 0;
    const carPrices = cars.filter((car) =>
      getValues("car_ids").includes(car.car_id)
    );
    const dishCostPerServing =
      dishesMappings
        .find(
          (dishMapping) => dishMapping.catering_id === getValues("catering_id")
        )
        ?.dishes.reduce(
          (total, dish) =>
            total +
            dish.dish_cost_per_serving * getValues("booking_guest_count"),
          0
        ) || 0;

    const carRentalPrice = carPrices.reduce(
      (total, car) => total + car.car_rental_price,
      0
    );

    // Calculate total cost
    const calculatedTotal =
      venuePrice + decorationPrice + carRentalPrice + dishCostPerServing;

    // Calculate cost after discount
    const promo_id = getValues("promo_id");
    const promo = promos.find((p) => p.promo_id === promo_id);
    const promo_discount = promo?.promo_discount || 0 + loyaltyDiscount;
    const calculatedCostAfterDiscount = Math.ceil(
      calculatedTotal * (1 - promo_discount)
    );

    // Update state
    setTotalCost(calculatedTotal);
    setCostAfterDiscount(calculatedCostAfterDiscount);
    setDiscountPercentage(promo_discount);
  };

  useEffect(() => {
    // Recalculate whenever relevant fields change
    calculateTotalCost();
  }, [
    getValues("venue_id"),
    getValues("decoration_id"),
    getValues("car_ids"),
    getValues("catering_id"),
    getValues("booking_guest_count"),
    getValues("promo_id"),
  ]);

  watch([
    "catering_id",
    "venue_id",
    "decoration_id",
    "car_ids",
    "booking_guest_count",
    "promo_id",
  ]);

  return (
    <Grid container justifyContent="center">
      <Grid size={{ xs: 12, sm: 8, md: 6 }}>
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h5" gutterBottom>
                {bookingID ? "Update Booking" : "Create Booking"}
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
                async (data: CreateUserBookingFormValues) => {
                  console.log(data);
                  await mutate(data);
                }
              )}
            >
              <Grid container spacing={2}>
                {/* Booking Event Date */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" sx={{ marginBottom: "4px" }}>
                    Event Date
                  </Typography>
                  <Controller
                    control={control}
                    name="booking_event_date"
                    render={({ field }) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          value={field.value ? dayjs(field.value) : null}
                          inputRef={field.ref}
                          onChange={(date) =>
                            field.onChange(date ? date.toDate() : null)
                          }
                          slotProps={{
                            textField: {
                              variant: "filled",
                              error: !!errors.booking_event_date,
                              helperText: errors.booking_event_date?.message,
                            },
                          }}
                        />
                      </LocalizationProvider>
                    )}
                  />
                </Grid>

                {/* Guest Count */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" sx={{ marginBottom: "4px" }}>
                    Guest Count
                  </Typography>
                  <Controller
                    name="booking_guest_count"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        onChange={(e) =>
                          field.onChange(
                            (e.target as HTMLInputElement).valueAsNumber || 0
                          )
                        } // Convert to number
                        error={!!errors.booking_guest_count}
                        helperText={errors.booking_guest_count?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Venue ID */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="venue_id"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.venue_id}>
                        <InputLabel id="venue-label">Venue</InputLabel>
                        <Select
                          {...field}
                          id="venue"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          label="Venue"
                        >
                          {venues.map((venue) => (
                            <MenuItem
                              key={venue.venue_id}
                              value={venue.venue_id}
                            >
                              {venue.venue_name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.venue_id && (
                          <Typography color="error" variant="caption">
                            {errors.venue_id.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                {/* Catering ID */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="catering_id"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.catering_id}>
                        <InputLabel id="catering-label">Catering</InputLabel>
                        <Select
                          {...field}
                          id="catering"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          label="Catering"
                        >
                          {caterings.map((catering) => (
                            <MenuItem
                              key={catering.catering_id}
                              value={catering.catering_id}
                            >
                              {catering.catering_name}
                            </MenuItem>
                          ))}
                          <MenuItem value={""}>
                            <em>None</em>
                          </MenuItem>
                        </Select>
                        {errors.catering_id && (
                          <Typography color="error" variant="body2">
                            {errors.catering_id.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  {getValues("catering_id") && (
                    <Typography variant="h6">Menu Items:</Typography>
                  )}
                  <List
                    sx={{
                      width: "100%",
                      maxWidth: 360,
                      bgcolor: "background.paper",
                    }}
                  >
                    {dishesMappings
                      .find(
                        (dishMapping) =>
                          dishMapping.catering_id === getValues("catering_id")
                      )
                      ?.dishes.map((dish) => (
                        <ListItem key={dish.dish_id}>
                          <ListItemText
                            primary={dish.dish_name}
                            secondary={
                              "Cost per serving: " + dish.dish_cost_per_serving
                            }
                          />
                        </ListItem>
                      ))}
                  </List>
                </Grid>

                {/* Decoration ID */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="decoration_id"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.decoration_id}>
                        <InputLabel id="decoration-label">
                          Decoration
                        </InputLabel>
                        <Select
                          {...field}
                          id="decoration"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          label="Decoration"
                        >
                          {decorations.map((decoration) => (
                            <MenuItem
                              key={decoration.decoration_id}
                              value={decoration.decoration_id}
                            >
                              {decoration.decoration_name}
                            </MenuItem>
                          ))}
                          <MenuItem value={""}>
                            <em>None</em>
                          </MenuItem>
                        </Select>
                        {errors.decoration_id && (
                          <Typography color="error" variant="body2">
                            {errors.decoration_id.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                {/* Promo ID */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="promo_id"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.promo_id}>
                        <InputLabel id="promo-label">Promo</InputLabel>
                        <Select
                          {...field}
                          id="promo"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          label="Promo"
                        >
                          {promos.map((promo) => (
                            <MenuItem
                              key={promo.promo_id}
                              value={promo.promo_id}
                              disabled={
                                new Date(promo.promo_expiry) <= new Date()
                              }
                            >
                              {`${promo.promo_name} `}
                              <Chip
                                sx={{ ml: 2 }}
                                variant="outlined"
                                color={
                                  new Date(promo.promo_expiry) <= new Date()
                                    ? "error"
                                    : "success"
                                }
                                label={
                                  new Date(promo.promo_expiry) <= new Date()
                                    ? "Expired"
                                    : "Valid"
                                }
                              />
                            </MenuItem>
                          ))}
                          <MenuItem value={""}>
                            <em>None</em>
                          </MenuItem>
                        </Select>
                        {errors.promo_id && (
                          <Typography color="error" variant="body2">
                            {errors.promo_id.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                {/* Cars */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="car_ids"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.car_ids}>
                        <InputLabel id="car_ids-label">Cars</InputLabel>
                        <Select
                          {...field}
                          multiple
                          value={field.value || []}
                          onChange={(e) => field.onChange(e.target.value)}
                          label="Cars"
                        >
                          {cars.map((car) => (
                            <MenuItem key={car.car_id} value={car.car_id}>
                              {`${car.car_make} ${car.car_model} ${car.car_year}`}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.car_ids && (
                          <Typography color="error" variant="body2">
                            {errors.car_ids.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
                {/* Billing */}
                <Typography variant="h6">Billing:</Typography>
                <Grid size={{ xs: 12 }}>
                  <List
                    sx={{
                      width: "100%",
                      maxWidth: 360,
                      bgcolor: "background.paper",
                    }}
                  >
                    <ListItem>
                      <ListItemText
                        primary={"Total Cost:"}
                        secondary={"$ " + totalCost}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={"Total Discount:"}
                        secondary={discountPercentage * 100 + "%"}
                      />
                    </ListItem>
                    {loyaltyDiscount == 0 || (
                      <Alert variant="outlined" severity="success">
                        You have received a {loyaltyDiscount * 100}% discount
                        for being a recurring customer
                      </Alert>
                    )}
                    <ListItem>
                      <ListItemText
                        primary={"Amount Due:"}
                        secondary={"$ " + costAfterDiscount}
                      />
                    </ListItem>
                  </List>
                </Grid>

                {/* Payment Method */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" sx={{ marginBottom: "4px" }}>
                    Payment Method
                  </Typography>
                  <Controller
                    control={control}
                    name="payment_method"
                    rules={{ required: "Payment method is required" }} // Optional validation rule
                    render={({ field }) => (
                      <FormControl
                        component="fieldset"
                        error={!!errors.payment_method}
                      >
                        <RadioGroup
                          {...field}
                          row
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        >
                          {[
                            "debit_card",
                            "credit_card",
                            "easypaisa",
                            "jazzcash",
                            "other",
                          ].map((method) => (
                            <FormControlLabel
                              key={method}
                              value={method}
                              control={<Radio size="small" />}
                              label={method.replace("_", " ").toUpperCase()} // Formats labels nicely
                            />
                          ))}
                        </RadioGroup>
                        {errors.payment_method && (
                          <Typography color="error" variant="caption">
                            {errors.payment_method.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
                {/* Payment Details */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Account Number or IBAN"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth type="number" label="CVC" />
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
                    ) : bookingID ? (
                      "Update Booking"
                    ) : (
                      "Create Booking"
                    )}
                  </Button>
                </Grid>

                {/* Success/Error Messages */}
                {isError && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="error">
                      {`Could not ${bookingID ? "update" : "create"} booking: ` +
                        error?.response?.data?.detail}
                    </Alert>
                  </Grid>
                )}
                {isSuccess && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="success">
                      {bookingID
                        ? "Booking updated successfully!"
                        : "Booking created successfully!"}
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

export default BookingForm;
