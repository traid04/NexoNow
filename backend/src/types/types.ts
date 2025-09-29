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

export type SecureNewUserEntry = Omit<NewUserEntry, "email" | "password"> & { avatarPhoto: string };

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

export type UpdateSellerDataEntry = {
  department?: string;
  city?: string;
  address?: string;
  floorOrApartment?: string | null;
  phoneNumber?: string;
}

export interface PhotoDestroyResponse {
  result: string;
}

export type NewReviewEntry = {
  userId: number;
  sellerId: number;
  comment?: string;
  rating: number;
}

export type UpdateReviewEntry = {
  comment?: string;
  rating?: number;
}

export enum ProductCondition {
  new = "new",
  used = "used",
  refurbished = "refurbished"
}

export enum ProductCurrency {
  uyu = "UYU",
  usd = "USD"
}

export type NewProductEntry = {
  sellerId: number;
  name: string;
  price: number;
  priceInUyu: number;
  currency: ProductCurrency;
  description?: string;
  stock: number;
  location: string;
  categoryId: number;
  condition: ProductCondition;
}

export enum OrderQuery {
  priceAsc = "lowerprice",
  priceDesc = "higherprice",
  mostRelevant = "mostrelevant"
}

export type QueryParams = {
  search?: string;
  limit?: number;
  offset?: number;
  location?: string;
  condition?: ProductCondition;
  minPrice?: number;
  maxPrice?: number;
  order?: OrderQuery;
}

export type UpdateProductEntry = {
  name?: string;
  price?: number;
  currency?: ProductCurrency;
  description?: string;
  stock?: number;
  location?: string;
  categoryId?: number;
  condition?: ProductCondition;
  priceInUyu?: number;
}

export interface CreateOfferEntry {
  offerPrice: number;
  startOfferDate: string;
  endOfferDate: string;
}

export type CartEntry = {
  productId: number;
  userId: number;
  quantity?: number;
}

export enum NotificationType {
  info = "info",
  success = "success",
  warning = "warning",
  error = "error",
  alert = "alert",
  system = "system",
  message = "message"
}

export interface NewNotificationEntry {
  text: string;
  type: NotificationType;
}