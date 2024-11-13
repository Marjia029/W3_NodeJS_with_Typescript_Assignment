import { Request, Response } from 'express';
import * as fs from 'fs';
import path from 'path';
import { createHotel } from '../controllers/hotelController';
import { createSlug } from '../utils/slugifyUtil';
import { findHotelBySlug } from '../controllers/hotelController';

// Mocking fs module and other utilities
jest.mock('fs');
jest.mock('../utils/slugifyUtil');
jest.mock('../controllers/hotelController', () => ({
  ...jest.requireActual('../controllers/hotelController'),
  findHotelBySlug: jest.fn(),
}));

// Mock the Request object
const mockReq = (body: object): Request => ({
  body,
  params: {},
  query: {},
} as Request);

// Mock the Response object
const mockRes = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('createHotel', () => {
  it('should create a new hotel with valid data', async () => {
    // Mock data for the request body
    mockReq.body = {
      title: 'Sample Hotel',
      description: 'A beautiful hotel.',
      guestCount: 4,
      bedroomCount: 2,
      bathroomCount: 1,
      hostInfo: 'Host info',
      address: '123 Street',
      latitude: 45.0,
      longitude: 90.0,
      rooms: [],
      images: [],
      amenities: [],
    };

    // Mock implementations for fs, slug, and findHotelBySlug
    (fs.readdirSync as jest.Mock).mockReturnValue(['1.json']);
    (fs.readFileSync as jest.Mock).mockReturnValueOnce(JSON.stringify({ id: 1 }));
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (createSlug as jest.Mock).mockReturnValue('sample-hotel');
    (findHotelBySlug as jest.Mock).mockReturnValue(null);

    // Call the function to test
    const res = mockRes();
    await createHotel(mockReq, res);

    // Expected new hotel data
    const expectedHotel = {
      id: 2,
      slug: 'sample-hotel',
      title: 'Sample Hotel',
      description: 'A beautiful hotel.',
      guestCount: 4,
      bedroomCount: 2,
      bathroomCount: 1,
      hostInfo: 'Host info',
      address: '123 Street',
      latitude: 45.0,
      longitude: 90.0,
      rooms: [],
      images: [],
      amenities: [],
    };

    // Assertions
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, '..', 'data', 'hotels', '2.json'),
      JSON.stringify(expectedHotel, Object.keys(expectedHotel).sort(), 2)
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Hotel created successfully',
      hotel: expectedHotel,
    });
  });

  it('should return 400 if required fields are missing', async () => {
    const missingFieldsHotel = {
      title: 'Sample Hotel', // Missing other required fields like 'description', 'guestCount', etc.
    };

    const req = mockReq(missingFieldsHotel);
    const res = mockRes();

    await createHotel(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing required field: description' });
  });

  it('should handle existing hotel slug conflict', async () => {
    mockReq.body = {
      title: 'Duplicate Hotel',
      description: 'Description',
      guestCount: 4,
      bedroomCount: 2,
      bathroomCount: 1,
      hostInfo: 'Host info',
      address: 'Address',
      latitude: 0,
      longitude: 0,
      rooms: [],
      images: [],
      amenities: [],
    };

    (fs.readdirSync as jest.Mock).mockReturnValue(['1.json']);
    (fs.readFileSync as jest.Mock).mockReturnValueOnce(JSON.stringify({ id: 1 }));
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (createSlug as jest.Mock).mockReturnValue('duplicate-hotel');
    (findHotelBySlug as jest.Mock).mockReturnValue({ id: 1, slug: 'duplicate-hotel' });

    const res = mockRes();
    await createHotel(mockReq, res);

    const expectedHotel = expect.objectContaining({
      slug: 'duplicate-hotel-2', // Conflict resolved by appending ID
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Hotel created successfully',
      hotel: expectedHotel,
    });
  });

  it('should return 500 on internal server error', async () => {
    (fs.readdirSync as jest.Mock).mockImplementation(() => {
      throw new Error('Internal error');
    });

    const res = mockRes();
    await createHotel(mockReq, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal server error',
    });
  });
});
