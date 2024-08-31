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
const client_1 = require("@prisma/client");
const messageController_1 = require("@/controllers/messageController");
const fixtures_1 = require("../fixtures");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("@/middleware/auth");
const middleware_1 = require("../utils/middleware");
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(middleware_1.setUserMiddleware);
// app.use(authenticateToken);
app.use("/admin", auth_1.checkAdmin);
app.post('/api/sendMessage', messageController_1.sendMessage);
app.post('/admin/messages/reply', messageController_1.adminReplyMessage);
app.get('/messages', messageController_1.getMessages);
app.get('/admin/messages/getUnread', messageController_1.getAdminUnreadMessages);
app.get('/admin/messages/getMessages/:userId', messageController_1.getUserMessages);
app.put('/api/message/markRead/:messageId', messageController_1.markMessageAsRead);
const secret = process.env.JWT_SECRET || "agiledatalabs";
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user.id, type: user.type }, secret, { expiresIn: '1h' });
};
describe('Message Controller', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Setup: Clear the database or create necessary test data
        yield prisma.message.deleteMany({});
        yield prisma.user.deleteMany({});
        // Reset the autoincrement ID for the user table
        yield prisma.$executeRaw `ALTER SEQUENCE "User_id_seq" RESTART WITH 1`;
        // Create test users
        yield prisma.user.createMany({
            data: fixtures_1.users,
        });
        // Create test messages
        yield prisma.message.createMany({
            data: [...fixtures_1.user_messages, ...fixtures_1.admin_messages,]
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Cleanup: Close the Prisma Client connection
        yield prisma.message.deleteMany({});
        yield prisma.user.deleteMany({});
        yield prisma.$disconnect();
    }));
    describe('POST /api/sendMessage', () => {
        it('should create a new message', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/sendMessage')
                .set('user', JSON.stringify({ id: 2, type: 'external' }))
                .send({ text: 'New Message' });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('text', 'New Message');
            // Verify the message was created in the database
            const message = yield prisma.message.findUnique({
                where: { id: response.body.id },
            });
            expect(message).not.toBeNull();
            expect(message === null || message === void 0 ? void 0 : message.text).toBe('New Message');
        }));
        it('should return 500 if text is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/sendMessage')
                .set('user', JSON.stringify({ id: 2, type: 'external' }))
                .send({});
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Text is required and cannot be null, empty, or undefined.');
        }));
    });
    describe('POST /admin/messages/reply', () => {
        it('should create a reply message with admin authorization', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/admin/messages/reply')
                .set('user', JSON.stringify({ id: 1, type: 'admin' }))
                .send({ text: 'Reply Message', sentTo: 2 });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('text', 'Reply Message');
            // Verify the message was created in the database
            const message = yield prisma.message.findUnique({
                where: { id: response.body.id },
            });
            expect(message).not.toBeNull();
            expect(message === null || message === void 0 ? void 0 : message.text).toBe('Reply Message');
        }));
        it('should return 403 if user is not an admin', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/admin/messages/reply')
                .set('user', JSON.stringify({ id: 2, type: 'external' }))
                .send({ text: 'Reply Message', sentTo: 2 });
            expect(response.status).toBe(403);
            expect(response.body.error).toBe('Forbidden');
        }));
        it('should return 400 if text or sentTo is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/admin/messages/reply')
                .set('user', JSON.stringify({ id: 1, type: 'admin' }))
                .send({ text: 'Reply Message' });
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Text is required and cannot be null, empty, or undefined. Recipient ID must be a valid number.');
        }));
    });
    describe('GET /messages', () => {
        it('should return a list of messages for the current user', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/messages')
                .set('user', JSON.stringify({ id: 2, type: 'external' }));
            expect(response.status).toBe(200);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('text');
        }));
    });
    describe('GET /admin/messages/getUnread', () => {
        it('should return a list of unread messages for admin', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/admin/messages/getUnread')
                .set('user', JSON.stringify({ id: 1, type: 'admin' }));
            expect(response.status).toBe(200);
            expect(response.body.data.length).toBeGreaterThan(0);
            expect(response.body.data[0]).toHaveProperty('text');
        }));
    });
    describe('GET /admin/messages/getMessages/:userId', () => {
        it('should return a list of messages for a specific user', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/admin/messages/getMessages/2')
                .set('user', JSON.stringify({ id: 1, type: 'admin' }));
            expect(response.status).toBe(200);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('text');
        }));
    });
    describe('PUT /api/message/markRead/:messageId', () => {
        it('should mark a message as read', () => __awaiter(void 0, void 0, void 0, function* () {
            const message = yield prisma.message.create({
                data: { text: 'Mark as Read', sentBy: 2, sentTo: 3 },
            });
            const response = yield (0, supertest_1.default)(app)
                .put(`/api/message/markRead/${message.id}`)
                .set('user', JSON.stringify({ id: 2, type: 'external' }));
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Message marked as read');
            // Verify the message was updated in the database
            const updatedMessage = yield prisma.message.findUnique({
                where: { id: message.id },
            });
            expect(updatedMessage === null || updatedMessage === void 0 ? void 0 : updatedMessage.readByReciever).toBe(true);
        }));
        it('should return 404 if messageId is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .put('/api/message/markRead/99999')
                .set('user', JSON.stringify({ id: 2, type: 'external' }));
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Message not found');
        }));
    });
});
