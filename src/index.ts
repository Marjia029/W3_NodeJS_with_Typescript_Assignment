import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

export const app = express();
const PORT = 5000;

// Middleware to parse JSON requests
app.use(express.json());

// Define the directories
const dataDir = path.join(__dirname, '..', 'data');
const hotelsDir = path.join(dataDir, 'hotels');
const publicDir = path.join(__dirname, '..', 'public');
const roomImagesDir = path.join(publicDir, 'roomImages');

// Ensure directories exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}
if (!fs.existsSync(hotelsDir)) {
  fs.mkdirSync(hotelsDir);
}
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}
if (!fs.existsSync(roomImagesDir)) {
  fs.mkdirSync(roomImagesDir, { recursive: true });
}

// Serve static files
app.use('/roomImages', express.static(roomImagesDir));

// Import routes
import hotelRoutes from './routes/hotelRoutes';
import imageRoutes from './routes/imageRoutes';
import roomImageRoutes from './routes/roomImageRoutes';

// Routes
app.use('/hotels', hotelRoutes);
app.use('/images', imageRoutes);
app.use('/images/rooms', roomImageRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});