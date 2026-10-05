import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

export function isCloudinaryEnabled() {
  return !!process.env.CLOUDINARY_URL;
}

export async function processUploadedFile(file, type = 'image') {
  if (!file) return '';

  if (isCloudinaryEnabled()) {
    try {
      const resourceType = type === 'audio' ? 'video' : 'image';
      const folder = type === 'audio' ? 'auraverse/audio' : 'auraverse/images';

      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: resourceType,
        folder,
      });

      // Remove temporary local file
      if (fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (e) {}
      }

      return result.secure_url;
    } catch (err) {
      console.error('Cloudinary upload failed, falling back to local file:', err.message);
    }
  }

  // Local file path
  if (file.fieldname === 'audio') {
    return `/uploads/audio/${file.filename}`;
  } else if (file.fieldname === 'cover') {
    return `/uploads/covers/${file.filename}`;
  } else if (file.fieldname === 'avatar') {
    return `/uploads/avatars/${file.filename}`;
  }
  return `/uploads/${file.filename}`;
}
