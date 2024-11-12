import express from 'express';
import { uploadImage, uploadImageMiddleware } from '../controllers/imageController';

const router = express.Router();

// POST /images/:identifier - Upload images and update the hotel’s images field
// `identifier` can be either the hotel ID or slug
router.post('/:identifier', uploadImageMiddleware, uploadImage);

export default router;
