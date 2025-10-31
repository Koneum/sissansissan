import type { Session, User } from "better-auth/types"

export interface ExtendedUser extends User {
  role: "ADMIN" | "CUSTOMER" | "SUPER_ADMIN"
}

export interface ExtendedSession extends Session {
  user: ExtendedUser
}
