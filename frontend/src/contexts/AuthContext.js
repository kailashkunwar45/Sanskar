import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import * as storage from "../services/storage";
import { httpRequest } from "../services/http/client";

const AuthContext = createContext(null);

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,       // true while restoring session
  isAuthenticated: false,
  isGuest: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case "RESTORE_SESSION":
      return {
        ...state,
        user: action.user,
        accessToken: action.accessToken,
        refreshToken: action.refreshToken,
        isAuthenticated: !!action.accessToken,
        isLoading: false,
      };
    case "LOGIN":
      return {
        ...state,
        user: action.user,
        accessToken: action.accessToken,
        refreshToken: action.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGOUT":
      return { ...initialState, isLoading: false };
    case "SKIP_AUTH":
      return { ...state, isGuest: true, isLoading: false };
    case "SET_LOADING":
      return { ...state, isLoading: action.value };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore saved session on mount
  useEffect(() => {
    (async () => {
      try {
        const accessToken = await storage.getAccessToken();
        const refreshToken = await storage.getRefreshToken();
        const user = await storage.getUser();
        dispatch({
          type: "RESTORE_SESSION",
          accessToken,
          refreshToken,
          user,
        });
      } catch {
        dispatch({ type: "RESTORE_SESSION", accessToken: null, refreshToken: null, user: null });
      }
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await httpRequest("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    // Fetch user profile
    const profileData = await httpRequest("/api/auth/me", {
      headers: { Authorization: `Bearer ${data.accessToken}` },
    });
    await storage.storeTokens(data.accessToken, data.refreshToken);
    await storage.storeUser(profileData.user);
    dispatch({
      type: "LOGIN",
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: profileData.user,
    });
    return profileData.user;
  }, []);

  const register = useCallback(async (name, email, password, role, religionPreference, phone, address, location) => {
    const data = await httpRequest("/api/auth/register", {
      method: "POST",
      body: { name, email, password, role, religionPreference, phone, address, location },
    });
    const profileData = await httpRequest("/api/auth/me", {
      headers: { Authorization: `Bearer ${data.accessToken}` },
    });
    await storage.storeTokens(data.accessToken, data.refreshToken);
    await storage.storeUser(profileData.user);
    dispatch({
      type: "LOGIN",
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: profileData.user,
    });
    return profileData.user;
  }, []);

  const skipLogin = useCallback(() => {
    dispatch({ type: "SKIP_AUTH" });
  }, []);

  const logout = useCallback(async () => {
    try {
      const rt = await storage.getRefreshToken();
      if (rt) {
        await httpRequest("/api/auth/logout", {
          method: "POST",
          body: { refreshToken: rt },
          headers: { Authorization: `Bearer ${state.accessToken}` },
        });
      }
    } catch {
      // swallow – we're logging out anyway
    }
    await storage.clearAll();
    dispatch({ type: "LOGOUT" });
  }, [state.accessToken]);

  const value = useMemo(
    () => ({ ...state, login, register, skipLogin, logout }),
    [state, login, register, skipLogin, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
