import { NewVerifyUserEntry, NewUserEntry, LoginUserEntry, NewSellerEntry, UpdateBasicDataEntry, UpdateEmailEntry, UpdatePasswordEntry } from "../types/types";
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

export const parseUpdateBasicDataInput = (entry: unknown): UpdateBasicDataEntry => {
  if (!entry || typeof entry !== 'object') {
    throw new Error('Invalid User: Object expected');
  }
  let parsedUpdate: UpdateBasicDataEntry = {};
  if ('username' in entry) {
    parsedUpdate.username = parseString(entry.username);
  }
  if ('firstName' in entry) {
    parsedUpdate.firstName = parseString(entry.firstName);
  }
  if ('lastName' in entry) {
    parsedUpdate.lastName = parseString(entry.lastName);
  }
  if ('birthDate' in entry) {
    parsedUpdate.birthDate = parseString(entry.birthDate);
  }
  return parsedUpdate;
};

export const parseEmailChange = (email: unknown): UpdateEmailEntry => {
  if (!email || typeof email !== 'object') {
    throw new Error('Invalid Data: Object expected');
  }
  if ('email' in email) {
    return {
      email: parseString(email.email)
    }
  }
  throw new Error('Undefined Email');
}

export const parsePasswordChange = (pass: unknown): UpdatePasswordEntry => {
  if (!pass || typeof pass !== 'object') {
    throw new Error('Invalid Data: Object expected');
  }
  if ('password' in pass) {
    return {
      password: parseString(pass.password)
    }
  }
  throw new Error('Undefined Password');
}