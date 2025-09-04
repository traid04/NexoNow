import { NewVerifyUserEntry, NewUserEntry, LoginUserEntry, NewSellerEntry } from "../types/types";
import { isString, isDate, isNumber } from "./typeGuards";

const parseString = (str: unknown): string => {
  if (!str || !isString(str)) {
    throw new Error("Invalid or undefined data: String expected");
  }
  return str;
};

const parseDate = (date: unknown): string => {
  if (!date || !isString(date) || !isDate(date)) {
    throw new Error("Invalid or undefined data: Date expected");
  }
  return date;
};

const parseNumber = (num: unknown): number => {
  if (!num || typeof num !== 'number' || !isNumber(num)) {
    throw new Error("Invalid or undefined data: Number expected");
  }
  return num;
}

export const parseNewUserEntry = (user: unknown): NewUserEntry => {
  if (!user || typeof user !== "object") {
    throw new Error("Invalid User: Object expected");
  }
  if ("username" in user && "firstName" in user && "lastName" in user && "birthDate" in user && "email" in user && "password" in user) {
    return {
      username: parseString(user.username),
      firstName: parseString(user.firstName),
      lastName: parseString(user.lastName),
      birthDate: parseDate(user.birthDate),
      email: parseString(user.email),
      password: parseString(user.password),
    };
  }
  throw new Error("Invalid Data: Some fields are missing");
};

export const parseVerifyUserEntry = (user: unknown): NewVerifyUserEntry => {
  if (!user || typeof user !== 'object') {
    throw new Error('Invalid User: Object expected');
  }
  if ('username' in user && 'email' in user && 'password' in user) {
    return {
      username: parseString(user.username),
      email: parseString(user.email),
      password: parseString(user.password)
    }
  }
  throw new Error("Invalid Data: Some fields are missing");
};

export const parseLoginUserEntry = (user: unknown): LoginUserEntry => {
  if (!user || typeof user !== 'object') {
    throw new Error('Invalid User: Object expected');
  }
  if ('email' in user && 'password' in user) {
    return {
      email: parseString(user.email),
      password: parseString(user.password)
    }
  }
  throw new Error("Invalid Data: Some fields are missing");
};

export const parseNewSellerEntry = (seller: unknown): NewSellerEntry => {
  if (!seller || typeof seller !== 'object') {
    throw new Error('Invalid Seller: Object expected');
  }
  if ('userId' in seller && 'department' in seller && 'city' in seller && 'address' in seller) {
    let parsedSeller: NewSellerEntry = {
      userId: parseNumber(seller.userId),
      department: parseString(seller.department),
      city: parseString(seller.city),
      address: parseString(seller.address),
    }
    if ('floorOrApartment' in seller) {
      parsedSeller.floorOrApartment = parseString(seller.floorOrApartment);
    }
    if ('phoneNumber' in seller) {
      parsedSeller.phoneNumber = parseString(seller.phoneNumber);
    }
    return parsedSeller;
  }
  throw new Error("Invalid Data: Some fields are missing");
};