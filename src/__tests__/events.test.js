const request = require('supertest');
const app = require('../index');
const users = require('../data/users');
const events = require('../data/events');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

describe('Event Planning System', () => {
  let authToken;
  
  beforeEach(() => {
    // Clear data
    users.length = 0;
    events.length = 0;
    
    // Create test user
    users.push({
      id: 1,
      username: 'testuser',
      password: 'hashedpassword'
    });
    
    // Generate auth token
    authToken = jwt.sign({ id: 1, username: 'testuser' }, JWT_SECRET);
  });

  describe('Event Operations', () => {
    test('Should create a new event', async () => {
      const response = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Event',
          description: 'Test Description',
          date: '2024-01-01',
          time: '10:00',
          category: 'Meeting',
          reminder: 30
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Test Event');
    });

    test('Should get user events', async () => {
      // Create test event
      events.push({
        id: 1,
        userId: 1,
        name: 'Test Event',
        description: 'Test Description',
        datetime: new Date('2024-01-01T10:00:00'),
        category: 'Meeting',
        reminder: 30
      });

      const response = await request(app)
        .get('/events')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
    });

    test('Should get upcoming reminders', async () => {
      // Create future event
      events.push({
        id: 1,
        userId: 1,
        name: 'Future Event',
        description: 'Test Description',
        datetime: new Date(Date.now() + 86400000), // Tomorrow
        category: 'Meeting',
        reminder: 30
      });

      const response = await request(app)
        .get('/events/reminders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
    });
  });
});