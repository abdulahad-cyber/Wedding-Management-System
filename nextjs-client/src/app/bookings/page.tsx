"use client";
import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import {
  Dialog,
  Chip,
  Fab,
  MenuItem,
  Select,
  SpeedDial,
  SpeedDialAction,
  Typography,
  Link,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DoneIcon from "@mui/icons-material/Done";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";

import CloseIcon from "@mui/icons-material/Close";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { useQuery, useQueryClient } from "react-query";
import api from "@/services/apiService";
import { AdminBookingModel, CarReservationModel, PaymentModel } from "@/types";
import AvatarProfile from "@/components/AvatarProfile";
import PageLoader from "@/components/PageLoader";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { AppBar, Box, Button, Stack, Toolbar, useTheme } from "@mui/material";
import BookingForm from "@/components/BookingForm";
import { useRouter } from "next/navigation";

const deleteBooking = async (booking_id: string) => {
  await api.delete("/bookings/" + booking_id);
};

const paginationModel = { page: 0, pageSize: 5 };

const actions = [
  { icon: <EditIcon color="warning" />, name: "Edit" },
  { icon: <DeleteForeverIcon color="error" />, name: "Delete" },
];

const Bookings = () => {
  const [selectedId, setSelectedId] = React.useState<string[]>([]);
  const [open, setOpen] = React.useState(false);
  const [payments, setPayments] = React.useState<
    { booking_id: string; payment: PaymentModel }[]
  >([]);
  const [paymentOpen, setPaymentOpen] = React.useState(false);
  const router = useRouter();

  const handleClose = () => {
    setOpen(false);
  };

  const handlePaymentClose = () => {
    setPaymentOpen(false);
  };
  const queryClient = useQueryClient();
  const { data: bookings } = useQuery(
    ["bookings", "me"],
    async (): Promise<AdminBookingModel[]> => {
      const { data } = await api.get("/bookings/me");
      const localpayments: { booking_id: string; payment: PaymentModel }[] = [];
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const bookingPromises = data.map(async (booking: any) => {
        localpayments.push({
          booking_id: booking.booking_id,
          payment: booking.payment,
        });
        const reservationPromises = booking.car_reservations.map(
          async (reservation: CarReservationModel) => {
            const { data } = await api.get(`/cars/${reservation.car_id}`);
            return data;
          }
        );
        const cars = await Promise.all(reservationPromises);

        return {
          ...booking,
          booking_date: new Date(booking.booking_date).toLocaleDateString(),
          booking_event_date: new Date(
            booking.booking_event_date
          ).toLocaleDateString(),
          id: booking.booking_id,
          venue: booking.venue.venue_name,
          user: booking.user.username,
          payment: booking.payment?.payment_id || "",
          catering: booking.catering?.catering_name || "",
          decoration: booking.decoration?.decoration_name || "",
          promo: booking.promo?.promo_name || "",
          cars: cars.map(
            (car) => car.car_make + " " + car.car_model + " " + car.car_year
          ),
        };
      });
      setPayments(localpayments);
      return await Promise.all(bookingPromises);
    },
    {
      onError: () => {
        console.error("Error fetching bookings");
      },
    }
  );
  /* eslint-disable @typescript-eslint/no-explicit-any */

  const handleSelectionChange = (id: any) => {
    setSelectedId(id);
    console.log("Selected ID:", id);
  };
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 320 },
    { field: "booking_date", headerName: "booking_date", width: 160 },
    {
      field: "booking_event_date",
      headerName: "booking_event_date",
      width: 160,
    },
    {
      field: "booking_guest_count",
      headerName: "guest_count",
      type: "number",
      width: 100,
    },
    {
      field: "booking_status",
      headerName: "booking_status",
      sortable: false,
      width: 160,
      renderCell: (params) => {
        return params.value === "declined" ? (
          <Chip label="Declined" color="error" deleteIcon={<CloseIcon />} />
        ) : params.value === "pending" ? (
          <Chip
            label="Pending"
            color="warning"
            deleteIcon={<AutorenewIcon />}
          />
        ) : (
          <Chip label="Confirmed" color="success" deleteIcon={<DoneIcon />} />
        );
      },
    },
    {
      field: "cars",
      headerName: "Cars",
      width: 120,
      renderCell: (params) => (
        <Select
          value={params?.value?.[0] || ""}
          displayEmpty
          sx={{ width: "100%", mx: 0, fontSize: "0.875rem" }}
        >
          {params.value?.length > 0 ? (
            params.value?.map((role: string, index: number) => (
              <MenuItem key={index} value={role}>
                {role}
              </MenuItem>
            ))
          ) : (
            <MenuItem value="" disabled>
              No Cars
            </MenuItem>
          )}
        </Select>
      ),
    },

    { field: "venue", headerName: "venue", width: 160 },
    {
      field: "payment",
      headerName: "payment ID",
      width: 320,
      renderCell: (params) => (
        <Link
          onClick={(e) => {
            if (selectedId.length > 0) e.stopPropagation();
            setPaymentOpen(true);
          }}
          href="#"
          variant="body2"
        >
          {params.value}
        </Link>
      ),
    },
    { field: "catering", headerName: "catering", width: 160 },
    { field: "decoration", headerName: "decoration", width: 160 },
    { field: "promo", headerName: "promo", width: 160 },
  ];

  const { loading } = useAuthGuard();
  const theme = useTheme();
  return loading ? (
    <PageLoader />
  ) : (
    <Box sx={{ display: "flex" }}>
      {/* Navbar */}
      <AppBar
        position="fixed"
        sx={{ zIndex: theme.zIndex.drawer + 1, bgcolor: "background.paper" }}
      >
        <Toolbar>
          <Typography
            color="primary"
            variant="logo"
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              p: 1,
              fontSize: "1.5rem",
            }}
          >
            SHAADI.COM
            <Chip
              sx={{ ml: 2 }}
              color="primary"
              variant="filled"
              label="User"
            />
          </Typography>
          <Stack gap={2} direction="row">
            <Button
              sx={{ py: 0 }}
              onClick={() => router.push("/")}
              size="small"
              variant="contained"
            >
              Home
            </Button>

            <AvatarProfile />
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          p: 2,
          bgcolor: theme.palette.background.default,
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        <Typography variant="h6" gutterBottom color="primary">
          Bookings
        </Typography>
        <Paper elevation={0} sx={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={bookings}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            onRowSelectionModelChange={handleSelectionChange}
            pageSizeOptions={[5, 10]}
            checkboxSelection
            disableMultipleRowSelection
            sx={{ border: 0 }}
          />
          <Fab
            sx={{
              position: "fixed",
              bottom: 16,
              right: 16,
            }}
            onClick={async () => {
              setSelectedId([]);
              setOpen(true);
            }}
          >
            <AddIcon color="primary" />
          </Fab>
          {selectedId.length > 0 && (
            <>
              <SpeedDial
                ariaLabel="SpeedDial basic example"
                sx={{
                  position: "fixed",
                  bottom: 16,
                  right: 90,
                }}
                icon={<SettingsIcon />}
              >
                {actions.map((action) => {
                  return (
                    (action.name === "Edit" &&
                      bookings?.find((b) => b.id === selectedId[0])
                        ?.booking_status != "pending") || (
                      <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        onClick={async () => {
                          if (action.name === "Delete") {
                            await deleteBooking(selectedId[0]);
                            setSelectedId([]);
                            queryClient.invalidateQueries("bookings");
                          } else if (action.name === "Edit") {
                            setOpen(true);
                          }
                        }}
                      />
                    )
                  );
                })}
              </SpeedDial>
            </>
          )}
        </Paper>
        <Dialog
          sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
          open={open}
          onClose={handleClose}
        >
          <BookingForm
            bookingID={selectedId.length > 0 ? selectedId[0] : null}
            loyaltyDiscount={Number(bookings?.length) > 1 ? 0.05 : 0}
            setOpen={setOpen}
          />
        </Dialog>
        <Dialog
          sx={(theme) => ({
            color: "#fff",
            zIndex: theme.zIndex.drawer + 1,
          })}
          open={paymentOpen}
          onClose={handlePaymentClose}
        >
          <Typography
            sx={{ p: 2, fontWeight: "bold" }}
            variant="h6"
            color="primary"
          >
            {"Payment Info for Booking ID: " + selectedId[0]}
          </Typography>
          <List
            sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
          >
            <ListItem>
              <ListItemText
                primary="Payment ID"
                secondary={
                  payments?.find(
                    ({ booking_id }) => booking_id === selectedId[0]
                  )?.payment.payment_id
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Total Amount"
                secondary={
                  payments?.find(
                    ({ booking_id }) => booking_id === selectedId[0]
                  )?.payment.total_amount
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Discount"
                secondary={
                  (payments?.find(
                    ({ booking_id }) => booking_id === selectedId[0]
                  )?.payment.discount || 0) *
                    100 +
                  "%"
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Amount Payed"
                secondary={
                  payments?.find(
                    ({ booking_id }) => booking_id === selectedId[0]
                  )?.payment.amount_payed
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Payment Method"
                secondary={
                  payments?.find(
                    ({ booking_id }) => booking_id === selectedId[0]
                  )?.payment.payment_method
                }
              />
            </ListItem>
          </List>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Bookings;
