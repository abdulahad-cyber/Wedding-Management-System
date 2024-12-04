import * as React from "react";
import Logout from "@mui/icons-material/Logout";
import { Account } from "@toolpad/core/Account";
import {
  AuthenticationContext,
  SessionContext,
  Session,
} from "@toolpad/core/AppProvider";
import { useAuthStore } from "@/stores/authStore";
import { logout } from "@/services/apiService";
import { useRouter } from "next/navigation";
import { useMutation } from "react-query";

export default function AvatarProfile() {
  const user = useAuthStore((state) => state.user);

  const demoSession = {
    user: {
      name: user?.username,
      email: user?.email,
    },
  };
  const [session] = React.useState<Session | null>(demoSession);

  const setUser = useAuthStore((state) => state.setUser);

  const router = useRouter();
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      setUser(null);
      router.push("/auth/login");
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const authentication = React.useMemo(() => {
    return {
      signIn: () => {},
      signOut: async () => {
        await logoutMutation.mutate();
      },
    };
  }, [logoutMutation]);

  return (
    <AuthenticationContext.Provider value={authentication}>
      <SessionContext.Provider value={session}>
        {/* preview-start */}
        <Account
          slotProps={{
            signInButton: {
              color: "success",
            },
            signOutButton: {
              color: "error",
              startIcon: <Logout />,
            },
            preview: {
              variant: "condensed",
              slotProps: {
                avatarIconButton: {
                  sx: {
                    width: "fit-content",
                    margin: "auto",
                  },
                },
                avatar: {
                  variant: "circular",
                },
              },
            },
          }}
        />
        {/* preview-end */}
      </SessionContext.Provider>
    </AuthenticationContext.Provider>
  );
}
