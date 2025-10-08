import { createContext } from "react";

// Provide a safe default object to avoid runtime destructuring errors
// when a consumer reads the context before the provider mounts (during
// hot-reload or early render). The provider will override this value.
export const UserContext = createContext({});

export default UserContext;
