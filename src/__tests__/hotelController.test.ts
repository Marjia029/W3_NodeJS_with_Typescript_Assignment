import request from 'supertest';
import { app } from '../index.ts'; // Import the app
import * as hotelController from '../controllers/hotelController'; // Import the controller

// Mock the hotelController module
jest.mock('../controllers/hotelController'); 

describe('POST /hotels', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should create a hotel successfully with valid data', async () => {
    const hotelData = {
      title: 'Test Hotel',
      description: 'A beautiful hotel.',
      guestCount: 4,
      bedroomCount: 2,
      bathroomCount: 2,
      amenities: ['WiFi', 'Pool'],
      hostInfo: 'Friendly host',
      address: '123 Test St, Test City',
      latitude: 12.34,
      longitude: 56.78,
      rooms: [
        {
          hotelSlug: 'test-hotel',
          roomSlug: 'room-1',
          roomImage: 'room1.jpg',
          roomTitle: 'Luxury Suite',
          bedroomCount: 1
        }
      ]
    };

    // Mocking the actual behavior of createHotel
    (hotelController.createHotel as jest.Mock).mockResolvedValueOnce({
      status: 201,
      message: 'Hotel created successfully',
      hotel: {
        ...hotelData,
        slug: 'test-hotel',
      }
    });

    const response = await request(app)
      .post('/hotels')
      .send(hotelData)
      .expect('Content-Type', /json/)
      .expect(201); // Expecting 201 for a successful creation

    expect(response.body.message).toBe('Hotel created successfully');
    expect(response.body.hotel.title).toBe(hotelData.title);
    expect(response.body.hotel.slug).toBe('test-hotel');
  });

  it('should return 400 if required fields are missing', async () => {
    const hotelData = {
      title: 'Test Hotel',
      description: 'A beautiful hotel.',
      guestCount: 4,
      // Missing required fields like bedroomCount, bathroomCount, etc.
    };

    const response = await request(app)
      .post('/hotels')
      .send(hotelData)
      .expect(400);

    expect(response.body.errors.length).toBeGreaterThan(0);
  });
});
