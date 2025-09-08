import { FileFilterCallback } from 'multer';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import streamifier from 'streamifier';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } from '../utils/config';
import { AvatarDestroyResponse } from '../types/types';

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error('Cloudinary credentials invalid');
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
});

export const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const type = file.mimetype;
  const correctType = type.startsWith('image/jpeg') || type.startsWith('image/png');
  if (correctType) {
    cb(null, true);
  }
  else {
    cb(new Error('Invalid file type. Only JPG and PNG are allowed') as any, false);
  }
}

export const uploadAvatar = (req: Express.Multer.File): Promise<UploadApiResponse | undefined> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, callResult) => {
      if (error) {
        reject(error);
      }
      resolve(callResult);
    })
    streamifier.createReadStream(req.buffer).pipe(stream);
  });
}

export const deleteAvatar = (publicId: string): Promise<AvatarDestroyResponse> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        return reject(error);
      }
      else {
        resolve(result);
      }
    })
  });
}