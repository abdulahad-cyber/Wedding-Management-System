"use client";

import * as React from "react";
import RouterLink from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Controller, useForm } from "react-hook-form";
import { z as zod } from "zod";
import { signUp } from "@/services/apiService";
import { useAuthStore, User } from "@/stores/authStore";
import { useMutation } from "react-query";
import { Snackbar } from "@mui/material";

const schema = zod.object({
  username: zod.string().min(1, { message: "Username name is required" }),
  email: zod.string().min(1, { message: "Email is required" }).email(),
  password: zod
    .string()
    .min(6, { message: "Password should be at least 6 characters" }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = {
  username: "",
  email: "",
  password: "",
} satisfies Values;

function SignUpPage(): React.JSX.Element {
  const router = useRouter();
  const [open, setOpen] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const { setUser } = useAuthStore();
  const signupMutation = useMutation({
    mutationFn: signUp,
    onSuccess: (user) => {
      setUser(user);
    },
    onError: () => {
      setOpen(true);
    },
  });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      signupMutation.mutate(values, {
        onSuccess: (user: User) => {
          user.is_admin ? router.push("/dashboard") : router.push("/");
        },
      });
    },
    [router, setError,signupMutation]
  );

  return (
    <Stack
      spacing={3}
      sx={{ width: "100%", maxWidth: "400px", mx: "auto", my: 2, p: 1 }}
    >
      <Stack spacing={1}>
        <Typography variant="logo" color="primary" sx={{ textAlign: "center" }}>
          SHAADI.COM
        </Typography>
        <Typography variant="h4">Sign up</Typography>
        <Typography color="text.secondary" variant="body2">
          Already have an account?{" "}
          <Link
            component={RouterLink}
            href={"/auth/login"}
            underline="hover"
            variant="subtitle2"
          >
            Sign in
          </Link>
        </Typography>
      </Stack>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="username"
            render={({ field }) => (
              <FormControl error={Boolean(errors.username)}>
                <InputLabel>Username</InputLabel>
                <OutlinedInput {...field} label="Username" />
                {errors.username ? (
                  <FormHelperText>{errors.username.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>Email address</InputLabel>
                <OutlinedInput {...field} label="Email address" type="email" />
                {errors.email ? (
                  <FormHelperText>{errors.email.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)}>
                <InputLabel>Password</InputLabel>
                <OutlinedInput {...field} label="Password" type="password" />
                {errors.password ? (
                  <FormHelperText>{errors.password.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />

          {errors.root ? (
            <Alert color="error">{errors.root.message}</Alert>
          ) : null}
          <Button
            disabled={signupMutation.isLoading}
            type="submit"
            variant="contained"
          >
            Sign up
          </Button>
        </Stack>
      </form>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={(open) => setOpen(!open)}
      >
        <Alert
          onClose={(open) => setOpen(!open)}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Invalid credentials
        </Alert>
      </Snackbar>
    </Stack>
  );
}
export default SignUpPage;
