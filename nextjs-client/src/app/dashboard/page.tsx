"use client";
import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { User } from "@/stores/authStore";
import { Box, Chip, Stack, Typography } from "@mui/material";
import api from "@/services/apiService";
import { BarChart } from "@mui/x-charts/BarChart";
import { PaymentModel } from "@/types";
import { PieChart } from "@mui/x-charts";
import Divider from "@mui/material/Divider";

export default function Overview() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [payments, setPayments] = React.useState<PaymentModel[]>([]);
  const [bookings, setBookings] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      const { data } = await api.get("/users");
      setUsers(data);
      const { data: bookingData } = await api.get("/bookings");
      setBookings(bookingData);
      setPayments([
        ...bookingData.map(({ payment }: { payment: PaymentModel }) => payment),
      ]);
    })();
  }, []);
  return (
    <>
      <Typography variant="h5" color="primary">
        Users
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>User ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.user_id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {user.user_id}
                </TableCell>
                <TableCell component="th" scope="row">
                  {user.username}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.is_admin ? (
                    <Chip label="Admin" />
                  ) : (
                    <Chip label="User" variant="outlined" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box gap={4} sx={{ py: 4 }}>
        <Typography variant="h5" color="primary">
          Total Earnings:
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {"$ " +payments.reduce((sum, payment) => sum + payment.amount_payed, 0)}
        </Typography>
      </Box>
      <Divider />
      <Stack flexDirection="row">
        <Box>
          <Typography sx={{ mt: 2 }} variant="h5" color="primary">
            Payment Methods Distribution
          </Typography>
          <BarChart
            xAxis={[
              {
                id: "barCategories",
                data: [
                  "debit_card",
                  "credit_card",
                  "easypaisa",
                  "jazzcash",
                  "other",
                ],
                scaleType: "band",
              },
            ]}
            series={[
              {
                data: [
                  payments.filter(
                    ({ payment_method }) => payment_method === "debit_card"
                  ).length,
                  payments.filter(
                    ({ payment_method }) => payment_method === "credit_card"
                  ).length,
                  payments.filter(
                    ({ payment_method }) => payment_method === "easypaisa"
                  ).length,
                  payments.filter(
                    ({ payment_method }) => payment_method === "jazzcash"
                  ).length,
                  payments.filter(
                    ({ payment_method }) => payment_method === "other"
                  ).length,
                ],
              },
            ]}
            width={500}
            height={300}
          />
        </Box>
        <Divider orientation="vertical" sx={{ mr: 2 }} />
        <Box>
          <Typography sx={{ my: 2 }} variant="h5" color="primary">
            Booking Status Distribution
          </Typography>
          <PieChart
            series={[
              {
                data: [
                  {
                    id: 0,
                    value: bookings.filter(
                      ({ booking_status }) => booking_status === "pending"
                    ).length,
                    label: "Pending",
                  },
                  {
                    id: 1,
                    value: bookings.filter(
                      ({ booking_status }) => booking_status === "confirmed"
                    ).length,
                    label: "Confirmed",
                  },
                  {
                    id: 2,
                    value: bookings.filter(
                      ({ booking_status }) => booking_status === "declined"
                    ).length,
                    label: "Declined",
                  },
                ],
              },
            ]}
            width={400}
            height={200}
          />
        </Box>
      </Stack>
    </>
  );
}
