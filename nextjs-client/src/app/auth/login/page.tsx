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
import { EyeIcon, EyeClosed as EyeSlashIcon } from "lucide-react";
// import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
// import { EyeSlash as EyeSlashIcon } from "@phosphor-icons/react/dist/ssr/EyeSlash";
import { Controller, useForm } from "react-hook-form";
import { z as zod } from "zod";
import { login } from "@/services/apiService";
import { useMutation } from "react-query";
import { useAuthStore, User } from "@/stores/authStore";
import { Snackbar } from "@mui/material";

// const ds = Dancing_Script({
//   weight: ["400"],
//   subsets: ["latin"],
//   variable: "--font-ds",
// });

const schema = zod.object({
  email: zod.string().min(1, { message: "Email is required" }).email(),
  password: zod.string().min(1, { message: "Password is required" }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = {
  email: "daaim@shaadi.com",
  password: "Secret1",
} satisfies Values;

 function SigninPage() {
  const [showPassword, setShowPassword] = React.useState<boolean>();
  const [open, setOpen] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });
  const router = useRouter();
  const { setUser } = useAuthStore();
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      setUser(user);
    },
    onError: () => {
      setOpen(true);
    },
  });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      loginMutation.mutate(values, {
        onSuccess: (user: User) => {
          user.is_admin ? router.push("/dashboard") : router.push("/");
        },
      });
    },
    [router, setError, loginMutation]
  );

  return (
    <Stack
      sx={{ width: "100%", maxWidth: "400px", mx: "auto", my: 2, p: 1 }}
      spacing={4}
    >
      <Typography variant="logo" color="primary" sx={{ textAlign: "center" }}>
        SHAADI.COM
      </Typography>
      <Stack spacing={1}>
        <Typography variant="h4">Sign in</Typography>
        <Typography color="text.secondary" variant="body2">
          Don&apos;t have an account?{" "}
          <Link
            component={RouterLink}
            href={"/auth/signup"}
            underline="hover"
            variant="subtitle2"
          >
            Sign up
          </Link>
        </Typography>
      </Stack>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
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
                <OutlinedInput
                  {...field}
                  endAdornment={
                    showPassword ? (
                      <EyeIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword(false);
                        }}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword(true);
                        }}
                      />
                    )
                  }
                  label="Password"
                  type={showPassword ? "text" : "password"}
                />
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
            disabled={loginMutation.isLoading}
            type="submit"
            variant="contained"
          >
            Sign in
          </Button>
        </Stack>
      </form>
      <Alert color="warning">
        Use{" "}
        <Typography component="span" sx={{ fontWeight: 700 }} variant="inherit">
          admin
        </Typography>{" "}
        with password{" "}
        <Typography component="span" sx={{ fontWeight: 700 }} variant="inherit">
          admin
        </Typography>{" "}
        to log in as admin user
      </Alert>
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
export default SigninPage;
