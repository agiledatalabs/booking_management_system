"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const authController_1 = require("@/controllers/authController");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post('/register', authController_1.register);
describe('POST /register', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Setup: Clear the database or create necessary test data
        yield prisma.$executeRaw `ALTER SEQUENCE "User_id_seq" RESTART WITH 1`;
        yield prisma.order.deleteMany({});
        yield prisma.user.deleteMany({});
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Cleanup: Close the Prisma Client connection
        yield prisma.user.deleteMany({});
        yield prisma.$disconnect();
    }));
    it('should register a new user', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/register')
            .send({
            name: 'John Doe',
            email: 'john.doe@example.com',
            mobile: 1234567890, // Ensure this is an integer
            password: 'password123',
            type: 'internal'
        });
        expect(response.status).toBe(201);
        expect(response.text).toBe('User registered');
        // Verify the user was created in the database
        const user = yield prisma.user.findUnique({
            where: { email: 'john.doe@example.com' }
        });
        expect(user).not.toBeNull();
        expect(user === null || user === void 0 ? void 0 : user.name).toBe('John Doe');
    }));
    it('should not accept blank or null fields', () => __awaiter(void 0, void 0, void 0, function* () {
        const testCases = [
            { name: '', email: 'john.doe@example.com', mobile: 1234567890, password: 'password123', type: 'internal' },
            { name: 'John Doe', email: '', mobile: 1234567890, password: 'password123', type: 'external' },
            { name: 'John Doe', email: 'john.doe@example.com', mobile: 0, password: 'password123', type: 'admin' },
            { name: 'John Doe', email: 'john.doe@example.com', mobile: 1234567890, password: '', type: null },
            { name: 'John Doe', email: 'john.doe@example.com', mobile: 1234567890, password: 'password123', type: '' },
            { name: null, email: 'john.doe@example.com', mobile: 1234567890, password: 'password123', type: 'admin' },
            { name: 'John Doe', email: null, mobile: 1234567890, password: 'password123', type: 'internal' },
            { name: 'John Doe', email: 'john.doe@example.com', mobile: null, password: 'password123', type: 'external' },
            { name: 'John Doe', email: 'john.doe@example.com', mobile: 1234567890, password: null, type: 'admin' },
            { name: 'John Doe', email: 'john.doe@example.com', mobile: 1234567890, password: 'password123', type: null }
        ];
        for (const testCase of testCases) {
            const response = yield (0, supertest_1.default)(app)
                .post('/register')
                .send(testCase);
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('All fields are required and must not be empty');
        }
    }));
});
app.use(express_1.default.json());
app.post('/login', authController_1.login);
describe('POST /login', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Setup: Clear the database and create a test user
        yield prisma.$executeRaw `ALTER SEQUENCE "User_id_seq" RESTART WITH 1`;
        yield prisma.order.deleteMany({});
        yield prisma.user.deleteMany({});
        const hashedPassword = yield bcryptjs_1.default.hash('password123', 10);
        yield prisma.user.create({
            data: {
                name: 'John Doe',
                email: 'john.doe@example.com',
                mobile: 1234567890,
                password: hashedPassword,
                type: 'internal',
            },
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Cleanup: Close the Prisma Client connection
        yield prisma.$disconnect();
    }));
    it('should login successfully with valid email and password', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/login')
            .send({
            email: 'john.doe@example.com',
            password: 'password123',
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        const decoded = jsonwebtoken_1.default.verify(response.body.token, process.env.SECRET_KEY || 'agiledatalabs');
        expect(decoded).toHaveProperty('id');
    }));
    it('should return 400 if email or password is missing', () => __awaiter(void 0, void 0, void 0, function* () {
        const response1 = yield (0, supertest_1.default)(app)
            .post('/login')
            .send({
            email: 'john.doe@example.com',
        });
        expect(response1.status).toBe(400);
        expect(response1.body.error).toBe('Email and password are required and must not be empty');
        const response2 = yield (0, supertest_1.default)(app)
            .post('/login')
            .send({
            password: 'password123',
        });
        expect(response2.status).toBe(400);
        expect(response2.body.error).toBe('Email and password are required and must not be empty');
    }));
    it('should return 400 if email or password is an empty string', () => __awaiter(void 0, void 0, void 0, function* () {
        const response1 = yield (0, supertest_1.default)(app)
            .post('/login')
            .send({
            email: '',
            password: 'password123',
        });
        expect(response1.status).toBe(400);
        expect(response1.body.error).toBe('Email and password are required and must not be empty');
        const response2 = yield (0, supertest_1.default)(app)
            .post('/login')
            .send({
            email: 'john.doe@example.com',
            password: '',
        });
        expect(response2.status).toBe(400);
        expect(response2.body.error).toBe('Email and password are required and must not be empty');
    }));
    it('should return 401 if email does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/login')
            .send({
            email: 'nonexistent@example.com',
            password: 'password123',
        });
        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Invalid email or password');
    }));
    it('should return 401 if password is incorrect', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/login')
            .send({
            email: 'john.doe@example.com',
            password: 'wrongpassword',
        });
        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Invalid email or password');
    }));
});
