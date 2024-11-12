import { createHotel, findHotelBySlug } from '../controllers/hotelController';
import { Request, Response } from 'express';
import fs from 'fs';

jest.mock('fs');

jest.mock('../controllers/hotelController', () => ({
  ...jest.requireActual('../controllers/hotelController'),
  getNextHotelId: jest.fn().mockReturnValue(1)
}));

describe('createHotel', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new hotel with valid data', async () => {
    mockReq.body = {
      title: 'Test Hotel',
      description: 'This is a test hotel',
      guestCount: 4,
      bedroomCount: 2,
      bathroomCount: 2,
      hostInfo: {
        name: 'John Doe',
        email: 'john@example.com'
      },
      address: '123 Main St, Anytown USA',
      latitude: 37.7749,
      longitude: -122.4194
    };

    // Mock the fs.existsSync function to return false, indicating that the hotel file doesn't exist
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);

    await createHotel(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Hotel created successfully',
      hotel: expect.objectContaining({
        id: 1,
        title: 'Test Hotel',
        slug: 'test-hotel'
      })
    });
  });

  // Rest of the test cases remain the same
});