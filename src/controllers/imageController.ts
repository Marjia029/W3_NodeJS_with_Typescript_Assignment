import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { Hotel } from '../models/hotelModel';
import { getHotelFilePath, findHotelBySlug } from './hotelController'; // Ensure `findHotelBySlug` is exported in the hotel controller

// Define upload directory path
const uploadDir = path.join(__dirname, '..', 'upload');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer storage options
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// POST /images/:identifier - Accepts hotelId or slug
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const identifier = req.params.identifier;
    let hotel: Hotel | null = null;

    // Check if the identifier is a number (ID) or string (slug)
    const hotelId = parseInt(identifier, 10);
    if (!isNaN(hotelId)) {
      const filePath = getHotelFilePath(hotelId);
      if (fs.existsSync(filePath)) {
        const hotelData = fs.readFileSync(filePath, 'utf-8');
        hotel = JSON.parse(hotelData);
      }
    } else {
      // If identifier is a slug, find hotel by slug
      hotel = await findHotelBySlug(identifier);
    }

    if (!hotel) {
      res.status(404).json({ error: 'Hotel not found' });
      return;
    }

    // Construct base URL for images
    const baseUrl = 'http://localhost:3000/images';  // Adjust this if needed

    // Update the images field with the uploaded file path(s)
    if (req.files && Array.isArray(req.files)) {
      const newImageUrls = req.files.map(file => `${baseUrl}/${file.filename}`);
      hotel.images.push(...newImageUrls);
    } else if (req.file) {
      const newImageUrl = `${baseUrl}/${req.file.filename}`;
      hotel.images.push(newImageUrl);
    }

    // Save the updated hotel data
    const filePath = getHotelFilePath(hotel.id);
    fs.writeFileSync(filePath, JSON.stringify(hotel, null, 2));

    res.status(200).json({
      message: 'Image uploaded and hotel updated successfully',
      images: hotel.images
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware to handle file uploads
export const uploadImageMiddleware = upload.array('images', 10);  // Allow up to 10 images
