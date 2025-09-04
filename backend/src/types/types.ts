import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

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

export type LoginUserEntry = Omit<NewVerifyUserEntry, 'username'>;

export interface RequestWithUser extends Request {
  user?: JwtPayload;
}

export type NewSellerEntry = {
  userId: number;
  department: string;
  city: string;
  address: string;
  floorOrApartment?: string;
  phoneNumber?: string;
}

export type UpdateBasicDataEntry = {
  username?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
}

export interface UpdateEmailEntry {
  email: string;
}

export interface UpdatePasswordEntry {
  password: string;
}