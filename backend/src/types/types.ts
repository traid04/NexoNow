export interface NewUserEntry {
  username: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  password: string;
}

export type SecureNewUserEntry = Omit<NewUserEntry, "email" | "password">;

export interface NewVerifyUserEntry {
  username: string;
  email: string;
  password: string;
}

export type LoginUserEntry = Omit<NewVerifyUserEntry, 'username'>