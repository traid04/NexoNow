import { Favorite, Product, ProductHistory, Seller, User } from "../models/index";
import express, { Router } from "express";
import { NewUserEntry, SecureNewUserEntry, NewVerifyUserEntry, RequestWithUser } from "../types/types";
import { parseVerifyUserEntry, parseNewUserEntry, parseUpdateBasicDataEntry, parseEmailChangeEntry, parsePasswordChangeEntry, parseQueryParams } from "../utils/parseInputs";
import bcrypt from "bcrypt";
import { JWT_TOP_SECRET_KEY } from "../utils/config";
import jsonwebtoken from 'jsonwebtoken';
import { sendChangeMail, sendVerificationMail } from "../services/mailService";
import { isObject } from "../utils/typeGuards";
import { tokenExtractor } from "../middleware/tokenExtractor";
import { deletePhoto, fileFilter, uploadPhoto } from "../services/imagesService";
import multer from 'multer';
import { IDValidator } from "../middleware/IDValidator";
const router: Router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter
});

router.get('/', async (_req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "avatarPhoto", "username", "firstName", "lastName", "birthDate", "email"],
      include: {
        model: Seller,
        attributes: {
          exclude: ['userId', 'createdAt', 'updatedAt']
        }
      }
    })
    return res.status(200).json(users);
  }
  catch(error) {
    next(error);
  }
});

router.get('/:id', IDValidator, async (req, res, next) => {
  try {
    const user = await User.findByPk(Number(req.params.id), {
      attributes: ["id", "username", "firstName", "lastName", "birthDate", "email"],
      include: {
        model: Seller,
        attributes: {
          exclude: ['userId', 'createdAt', 'updatedAt']
        }
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json(user);
  }
  catch(error) {
    next(error);
  }
});

router.post('/', upload.single('avatarPhoto'), async (req, res, next) => {
  if (!JWT_TOP_SECRET_KEY) {
    return res.status(400).json({ error: "JWT secret key cannot be undefined" });
  }
  try {
    if (!req.file) {
      return res.status(400).json({ error: "The profile picture is required" });
    }
    const avatar = await uploadPhoto(req.file);
    if (!avatar) {
      return res.status(400).json({ error: "Error uploading profile picture" })
    }
    const userEntry: NewUserEntry = parseNewUserEntry(req.body);
    const passwordHash = await bcrypt.hash(userEntry.password, 10);
    const verifyToken = jsonwebtoken.sign({ email: userEntry.email }, JWT_TOP_SECRET_KEY, { expiresIn: '1d' });
    const userToAdd = {
      avatarId: avatar.public_id,
      avatarPhoto: avatar.secure_url,
      username: userEntry.username,
      firstName: userEntry.firstName,
      lastName: userEntry.lastName,
      birthDate: userEntry.birthDate,
      email: userEntry.email,
      isVerified: false,
      verifyToken,
      passwordHash
    }
    await User.create(userToAdd);
    const user: SecureNewUserEntry = {
      avatarPhoto: userToAdd.avatarPhoto,
      username: userToAdd.username,
      firstName: userToAdd.firstName,
      lastName: userToAdd.lastName,
      birthDate: userToAdd.birthDate,
    };
    await sendVerificationMail(userToAdd.firstName, userToAdd.email, verifyToken, true);
    return res.status(201).json(user);
  }
  catch(error) {
    next(error);
  }
});

router.patch('/me/change-avatar', tokenExtractor, upload.single('avatarPhoto'), async (req: RequestWithUser, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Token missing or invalid" });
  }
  if (!req.file) {
    return res.status(400).json({ error: "New avatar photo required" });
  }
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!user.avatarId) {
      return res.status(404).json({ error: "This user does not have profile picture"});
    }
    const result = await deletePhoto(user.avatarId);
    if (result.result !== "ok") {
      return res.status(400).json({ error: result.result });
    }
    const newAvatar = await uploadPhoto(req.file);
    if (!newAvatar) {
      return res.status(400).json({ error: "Error uploading profile picture" });
    }
    user.avatarId = newAvatar.public_id;
    user.avatarPhoto = newAvatar.secure_url;
    await user.save();
    return res.status(200).json({ message: 'Image updated successfully', newAvatar: newAvatar.secure_url });
  }
  catch(error) {
    next(error); 
  }
});

router.delete('/me', tokenExtractor, async (req: RequestWithUser, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }
  try {
    if (isNaN(req.user.userId)) {
      return res.status(400).json({ error: 'Invalid User ID' });
    }
    const deletedCount = await User.destroy({
      where: {
        id: req.user.userId
      }
    })
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(204).end();
  }
  catch(error) {
    next(error);
  }
});

router.patch('/me', tokenExtractor, async (req: RequestWithUser, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }
  try {
    const newUpdate = parseUpdateBasicDataEntry(req.body);
    const [updatedCount] = await User.update(
      newUpdate,
      {
        where: {
          id: req.user.userId
        }
      }
    )
    if (updatedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userUpdated = await User.findByPk(req.user.userId, { attributes: ["id", "username", "firstName", "lastName", "birthDate", "email"] });
    return res.status(200).json(userUpdated);
  }
  catch(error) {
    next(error);
  }
});

router.post('/me/change-email', tokenExtractor, async (req: RequestWithUser, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }
  if (!JWT_TOP_SECRET_KEY) {
    return res.status(400).json({ error: "JWT secret key cannot be undefined" });
  }
  try {
    const newEmail = parseEmailChangeEntry(req.body).email;
    const user = await User.findByPk(req.user.userId);
    if (!user || !('firstName' in user && 'email' in user)) {
      return res.status(404).json({ error: 'User not found' });
    }
    const token = jsonwebtoken.sign({ username: user.username, actualEmail:user.email, newEmail }, JWT_TOP_SECRET_KEY, { expiresIn: '10m' });
    await sendChangeMail(user.firstName, user.email, token, 'changeEmail');
    return res.status(200).json({ message: 'Change email successfully sent' });
  }
  catch(error) {
    next(error);
  }
});

router.get('/me/change-email/:token', async (req, res, next) => {
  if (!JWT_TOP_SECRET_KEY) {
    return res.status(400).json({ error: "JWT secret key cannot be undefined" });
  }
  try {
    const decodedToken = jsonwebtoken.verify(req.params.token, JWT_TOP_SECRET_KEY);
    if (!isObject(decodedToken) || !('username' in decodedToken && 'actualEmail' in decodedToken && 'newEmail' in decodedToken)) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const [updatedCount] = await User.update({ email: decodedToken.newEmail }, {
      where: {
        username: decodedToken.username,
        email: decodedToken.actualEmail
      }
    })
    if (updatedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({ message: 'Email changed successfully' });
  }
  catch(error) {
    next(error);
  }
});

router.post('/me/change-password', tokenExtractor, async (req: RequestWithUser, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }
  if (!JWT_TOP_SECRET_KEY) {
    return res.status(400).json({ error: "JWT secret key cannot be undefined" });
  }
  try {
    const newPassword = parsePasswordChangeEntry(req.body).password;
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found, invalid Token' });
    }
    const token = jsonwebtoken.sign({ username: user?.username, actualPassword: user?.passwordHash, newPassword }, JWT_TOP_SECRET_KEY, { expiresIn: '10m' });
    await sendChangeMail(user.firstName, user.email, token, 'changePassword');
    return res.status(200).json({ message: 'Change Password mail successfully sent' });
  }
  catch(error) {
    next(error);
  }
});

router.get('/me/change-password/:token', async (req, res, next) => {
  if (!JWT_TOP_SECRET_KEY) {
    return res.status(400).json({ error: "JWT secret key cannot be undefined" });
  }
  try {
    const decodedToken = jsonwebtoken.verify(req.params.token, JWT_TOP_SECRET_KEY);
    if (!isObject(decodedToken) || !('username' in decodedToken && 'actualPassword' in decodedToken && 'newPassword' in decodedToken)) {
      return res.status(400).json({ error: 'Invalid Token structure' });
    }
    const newPasswordHash = await bcrypt.hash(decodedToken.newPassword, 10);
    const [updatedCount] = await User.update({ passwordHash: newPasswordHash }, {
      where: {
        username: decodedToken.username,
        passwordHash: decodedToken.actualPassword
      }
    });
    if (updatedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({ message: 'Password changed successfully' });
  }
  catch(error) {
    next(error);
  }
});

router.get('/verify/:token', async (req, res, next) => {
  if (!JWT_TOP_SECRET_KEY) {
    return res.status(400).json({ error: "JWT secret key cannot be undefined" });
  }
  try {
    const decodedToken = jsonwebtoken.verify(req.params.token, JWT_TOP_SECRET_KEY);
    const user = await User.findOne({
      where: {
        verifyToken: req.params.token
      }
    })
    const correctToken = isObject(decodedToken) && 'email' in decodedToken;
    if (user && user.isVerified) {
      user.verifyToken = '';
      await user.save();
      return res.status(400).json({ error: 'Account already verified' });
    }
    if (!correctToken) {
      return res.status(400).json({ error: 'Invalid Token structure' });
    }
    if (user && user.email === decodedToken.email) {
      user.isVerified = true;
      user.verifyToken = '';
      await user.save();
      return res.status(200).json({ status: 'verified' });
    }
    return res.status(404).json({ error: 'User not found, invalid Token' });
  }
  catch(error) {
    next(error);
  }
});

router.post('/verify/expired', async (req, res, next) => {
  if (!JWT_TOP_SECRET_KEY) {
    return res.status(400).json({ error: "Invalid JWT, secret key cannot be undefined" });
  }
  try {
    const { username, email, password }: NewVerifyUserEntry = parseVerifyUserEntry(req.body);
    const userToVerify = await User.findOne({
      where: {
        username,
        email
      }
    })
    if (!userToVerify) {
      return res.status(404).json({ error: 'User not found, invalid username or email' });
    }
    const decryptedPassword = await bcrypt.compare(password, userToVerify.passwordHash);
    if (!decryptedPassword) {
      return res.status(401).json({ error: 'Incorrect password' });
    }
    const newToken = jsonwebtoken.sign({ email }, JWT_TOP_SECRET_KEY, { expiresIn: '1d' });
    userToVerify.verifyToken = newToken;
    await userToVerify.save();
    await sendVerificationMail(userToVerify.firstName, userToVerify.email, newToken, false);
    return res.status(200).json({ message: 'Verification email sent' });
  }
  catch(error) {
    next(error);
  }
});

router.get('/me/productHistory', tokenExtractor, async (req: RequestWithUser, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Token missing or invalid" });
  }
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const queryParams = parseQueryParams(req.query);
    if (queryParams.limit === undefined || queryParams.offset === undefined) {
      return res.status(400).json({ error: "Limit and Offset cannot be undefined" });
    }
    if (queryParams.limit <= 0 || queryParams.offset < 0) {
      return res.status(400).json({ error: "Invalid limit or offset" });
    }
    const { count, rows: history } = await ProductHistory.findAndCountAll({
      limit: queryParams.limit,
      offset: queryParams.offset,
      order: [['createdAt', 'DESC']],
      where: {
        userId: user.id
      },
      attributes: {
        exclude: ["userId", "productId"]
      },
      include: {
        model: Product
      }
    });
    const totalPages = Math.ceil(count / queryParams.limit)
    const currentPage = Math.floor((queryParams.offset / queryParams.limit) + 1);
    return res.status(200).json({ history, totalResults: count, totalPages, currentPage });
  }
  catch(error) {
    next(error);
  }
});

router.get('/me/favorites', tokenExtractor, async (req: RequestWithUser, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Token missing or invalid" });
  }
  try {
    const favs = await User.findOne({
      where: {
        id: req.user.userId
      },
      include: {
        model: Product,
        as: "favorites",
        attributes: {
          exclude: ["createdAt", "updatedAt", "categoryId"]
        },
        through: { attributes: [] }
      },
      attributes: ["id", "username", "email", "birthDate", "createdAt", "updatedAt", "avatarPhoto"],
      order: [[{ model: Product, as: "favorites" }, Favorite, "createdAt", "DESC"]]
    });
    return res.status(200).json(favs);
  }
  catch(error) {
    next(error);
  }
});

export default router;
