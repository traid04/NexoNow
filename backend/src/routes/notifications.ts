import express from 'express';
import { parseNewNotificationEntry } from '../utils/parseInputs';
import { IDValidator } from '../middleware/IDValidator';
import { Notification, User } from '../models/index';
import { tokenExtractor } from '../middleware/tokenExtractor';
import { tokenValidator } from '../middleware/tokenValidator';
import { RequestWithUser } from '../types/types';

const router = express.Router();

router.post('/', tokenExtractor, tokenValidator, async (req: RequestWithUser, res, next) => {
  try {
    const user = await User.findByPk(req.user!.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const notificationBody = { ...parseNewNotificationEntry(req.body), userId: user.id };
    const newNotification = await Notification.create(notificationBody);
    return res.status(201).json(newNotification);
  }
  catch(error) {
    next(error);
  }
});

router.delete('/:id', IDValidator, tokenExtractor, tokenValidator, async (req: RequestWithUser, res, next) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: Number(req.params.id),
        userId: req.user!.userId
      }
    });
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    await notification.destroy();
    return res.status(204).end();
  }
  catch(error) {
    next(error);
  }
});

export default router;