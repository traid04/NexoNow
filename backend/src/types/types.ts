export interface NewUserEntry {
  username: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  password: string;
}

export type SecureNewUserEntry = Omit<NewUserEntry, "email" | "password">;