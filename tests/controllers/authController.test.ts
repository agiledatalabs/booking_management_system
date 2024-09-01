import request from 'supertest';
import express from 'express';
import { register, login } from '@/controllers/authController';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.post('/register', register);

describe('POST /register', () => {
  beforeAll(async () => {
    // Setup: Clear the database or create necessary test data
    await prisma.$executeRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1`;
    await prisma.order.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    // Cleanup: Close the Prisma Client connection
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  it('should register a new user', async () => {
    const response = await request(app).post('/register').send({
      name: 'John Doe',
      email: 'john.doe@example.com',
      mobile: 1234567890, // Ensure this is an integer
      password: 'password123',
      type: 'internal',
    });

    expect(response.status).toBe(201);
    expect(response.text).toBe('User registered');

    // Verify the user was created in the database
    const user = await prisma.user.findUnique({
      where: { email: 'john.doe@example.com' },
    });
    expect(user).not.toBeNull();
    expect(user?.name).toBe('John Doe');
  });

  it('should not accept blank or null fields', async () => {
    const testCases = [
      {
        name: '',
        email: 'john.doe@example.com',
        mobile: 1234567890,
        password: 'password123',
        type: 'internal',
      },
      {
        name: 'John Doe',
        email: '',
        mobile: 1234567890,
        password: 'password123',
        type: 'external',
      },
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        mobile: 0,
        password: 'password123',
        type: 'admin',
      },
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        mobile: 1234567890,
        password: '',
        type: null,
      },
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        mobile: 1234567890,
        password: 'password123',
        type: '',
      },
      {
        name: null,
        email: 'john.doe@example.com',
        mobile: 1234567890,
        password: 'password123',
        type: 'admin',
      },
      {
        name: 'John Doe',
        email: null,
        mobile: 1234567890,
        password: 'password123',
        type: 'internal',
      },
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        mobile: null,
        password: 'password123',
        type: 'external',
      },
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        mobile: 1234567890,
        password: null,
        type: 'admin',
      },
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        mobile: 1234567890,
        password: 'password123',
        type: null,
      },
    ];

    for (const testCase of testCases) {
      const response = await request(app).post('/register').send(testCase);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'All fields are required and must not be empty'
      );
    }
  });
});

app.use(express.json());
app.post('/login', login);

describe('POST /login', () => {
  beforeAll(async () => {
    // Setup: Clear the database and create a test user
    await prisma.$executeRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1`;
    await prisma.order.deleteMany({});
    await prisma.user.deleteMany({});
    const hashedPassword = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        mobile: 1234567890,
        password: hashedPassword,
        type: 'internal',
      },
    });
  });

  afterAll(async () => {
    // Cleanup: Close the Prisma Client connection
    await prisma.$disconnect();
  });

  it('should login successfully with valid email and password', async () => {
    const response = await request(app).post('/login').send({
      email: 'john.doe@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    const decoded = jwt.verify(
      response.body.token,
      process.env.SECRET_KEY || 'agiledatalabs'
    );
    expect(decoded).toHaveProperty('id');
  });

  it('should return 400 if email or password is missing', async () => {
    const response1 = await request(app).post('/login').send({
      email: 'john.doe@example.com',
    });

    expect(response1.status).toBe(400);
    expect(response1.body.error).toBe(
      'Email and password are required and must not be empty'
    );

    const response2 = await request(app).post('/login').send({
      password: 'password123',
    });

    expect(response2.status).toBe(400);
    expect(response2.body.error).toBe(
      'Email and password are required and must not be empty'
    );
  });

  it('should return 400 if email or password is an empty string', async () => {
    const response1 = await request(app).post('/login').send({
      email: '',
      password: 'password123',
    });

    expect(response1.status).toBe(400);
    expect(response1.body.error).toBe(
      'Email and password are required and must not be empty'
    );

    const response2 = await request(app).post('/login').send({
      email: 'john.doe@example.com',
      password: '',
    });

    expect(response2.status).toBe(400);
    expect(response2.body.error).toBe(
      'Email and password are required and must not be empty'
    );
  });

  it('should return 401 if email does not exist', async () => {
    const response = await request(app).post('/login').send({
      email: 'nonexistent@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid email or password');
  });

  it('should return 401 if password is incorrect', async () => {
    const response = await request(app).post('/login').send({
      email: 'john.doe@example.com',
      password: 'wrongpassword',
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid email or password');
  });
});
