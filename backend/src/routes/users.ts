import { User } from "../models/index";
import express, { Router } from "express";
import { NewUserEntry, SecureNewUserEntry } from "../types/types";
import { parseNewUserEntry } from "../utils/parseInputs";
import bcrypt from 'bcrypt';
const router: Router = express.Router();

router.get("/", async (_req, res) => {
  const users: User[] = await User.findAll({
    attributes: ["id", "username", "firstName", "lastName", "birthDate", "email"]
  });
  res.status(200).json(users);
});

router.post("/", async (req, res) => {
  try {
    const userEntry: NewUserEntry = parseNewUserEntry(req.body);
    const passwordHash: string = await bcrypt.hash(userEntry.password, 10);
    const userToAdd = {
      username: userEntry.username,
      firstName: userEntry.firstName,
      lastName: userEntry.lastName,
      birthDate: userEntry.birthDate,
      email: userEntry.email,
      passwordHash
    }
    await User.create(userToAdd);
    const user: SecureNewUserEntry = {
      username: userToAdd.username,
      firstName: userToAdd.firstName,
      lastName: userToAdd.lastName,
      birthDate: userToAdd.birthDate,
    };
    res.status(201).json(user);
  }
  catch(error: unknown) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    else {
      return res.status(400).json({ error: `Unknown error: ${error}` });
    }
  }
});

export default router;
