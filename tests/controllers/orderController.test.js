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
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const client_1 = require("@prisma/client");
const orderController_1 = require("@/controllers/orderController");
const enums_1 = require("@/shared/enums");
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post('/orders/blockOrder', orderController_1.blockOrder);
app.post('/orders/confirmOrder', orderController_1.confirmOrder);
describe('Order Controller', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Setup: Clear the database or create necessary test data
        yield prisma.order.deleteMany({});
        yield prisma.resource.deleteMany({});
        yield prisma.resourceType.deleteMany({});
        yield prisma.user.deleteMany({});
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Cleanup: Close the Prisma Client connection
        yield prisma.order.deleteMany({});
        yield prisma.resource.deleteMany({});
        yield prisma.resourceType.deleteMany({});
        yield prisma.user.deleteMany({});
        yield prisma.$disconnect();
    }));
    describe('POST /orders/blockOrder', () => {
        let userId;
        let resourceId;
        let resourceTypeId;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            // Setup: Create a user and a resource type and resource
            yield prisma.user.deleteMany({});
            yield prisma.resource.deleteMany({});
            yield prisma.resourceType.deleteMany({});
            const user = yield prisma.user.create({
                data: { name: 'TestUser', email: 'test@example.com', mobile: 1234567890, type: 'Internal', password: 'hashedpassword' },
            });
            userId = user.id;
            const resourceType = yield prisma.resourceType.create({
                data: { name: 'TestType' },
            });
            resourceTypeId = resourceType.id;
            const resource = yield prisma.resource.create({
                data: {
                    name: 'TestResource',
                    resourceTypeId,
                    maxQty: 10,
                    priceInternal: 100,
                    priceExternal: 150,
                    bookingType: enums_1.BookingType.TWO_HOUR,
                    active: true,
                },
            });
            resourceId = resource.id;
        }));
        it('should block an order', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/orders/blockOrder')
                .send({
                userId,
                resourceId,
                bookingDate: '2023-10-10',
                timeSlot: enums_1.TimeSlots.SLOT_10_12,
                resourceQty: 2,
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Resource blocked successfully.');
            // Verify the block was created in blockedOrders
        }));
        it('should return 400 if required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/orders/blockOrder')
                .send({});
            expect(response.status).toBe(400);
            expect(response.body.error).toContain('is required');
        }));
        it('should return 400 if resource quantity is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/orders/blockOrder')
                .send({
                userId,
                resourceId,
                bookingDate: '2023-10-10',
                timeSlot: enums_1.TimeSlots.SLOT_10_12,
                resourceQty: -1,
            });
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Resource quantity should be greater than 0.');
        }));
        it('should return 404 if resource not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/orders/blockOrder')
                .send({
                userId,
                resourceId: 99999,
                bookingDate: '2023-10-10',
                timeSlot: enums_1.TimeSlots.SLOT_10_12,
                resourceQty: 2,
            });
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Resource not found.');
        }));
        it('should return 400 if time slot is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/orders/blockOrder')
                .send({
                userId,
                resourceId,
                bookingDate: '2023-10-10',
                timeSlot: 'INVALID',
                resourceQty: 2,
            });
            expect(response.status).toBe(400);
            expect(response.body.error).toContain('Invalid time slot for the selected booking type.');
        }));
    });
    describe('POST /orders/confirmOrder', () => {
        let userId;
        let resourceId;
        let resourceTypeId;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            // Setup: Create a user and a resource type and resource
            yield prisma.user.deleteMany({});
            yield prisma.resource.deleteMany({});
            yield prisma.resourceType.deleteMany({});
            const user = yield prisma.user.create({
                data: { name: 'TestUser', email: 'test@example.com', mobile: 1234567890, type: 'Internal', password: 'hashedpassword' },
            });
            userId = user.id;
            const resourceType = yield prisma.resourceType.create({
                data: { name: 'TestType' },
            });
            resourceTypeId = resourceType.id;
            const resource = yield prisma.resource.create({
                data: {
                    name: 'TestResource',
                    resourceTypeId,
                    maxQty: 10,
                    priceInternal: 100,
                    priceExternal: 150,
                    bookingType: enums_1.BookingType.TWO_HOUR,
                    active: true,
                },
            });
            resourceId = resource.id;
            // Block an order for the user
            yield (0, supertest_1.default)(app)
                .post('/orders/blockOrder')
                .send({
                userId,
                resourceId,
                bookingDate: '2023-10-10',
                timeSlot: enums_1.TimeSlots.SLOT_10_12,
                resourceQty: 2,
            });
        }));
        it('should confirm an order', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/orders/confirmOrder')
                .send({
                userId,
                resourceId,
                resourceQty: 2,
                bookingDate: '2023-10-10',
                amount: 200,
                bookingType: enums_1.BookingType.TWO_HOUR,
                timeSlot: enums_1.TimeSlots.SLOT_10_12,
                mode: 'online',
                transactionId: 'txn123',
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Order confirmed successfully.');
            expect(response.body.order).toHaveProperty('id');
            // Verify the order was created in the database
            const order = yield prisma.order.findUnique({
                where: { id: response.body.order.id },
            });
            expect(order).not.toBeNull();
            expect(order === null || order === void 0 ? void 0 : order.status).toBe('confirmed');
        }));
        it('should return 400 if required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/orders/confirmOrder')
                .send({});
            expect(response.status).toBe(400);
            expect(response.body.error).toContain('is required');
        }));
        it('should return 400 if booking type is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/orders/confirmOrder')
                .send({
                userId,
                resourceId,
                resourceQty: 2,
                bookingDate: '2023-10-10',
                amount: 200,
                bookingType: 'INVALID',
                timeSlot: enums_1.TimeSlots.SLOT_10_12,
                mode: 'online',
                transactionId: 'txn123',
            });
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid booking type.');
        }));
        it('should return 400 if no block found for the given key', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/orders/confirmOrder')
                .send({
                userId,
                resourceId,
                resourceQty: 2,
                bookingDate: '2023-10-11',
                amount: 200,
                bookingType: enums_1.BookingType.TWO_HOUR,
                timeSlot: enums_1.TimeSlots.SLOT_10_12,
                mode: 'online',
                transactionId: 'txn123',
            });
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('No block found for the given key.');
        }));
        it('should return 400 if no block found for the given user', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/orders/confirmOrder')
                .send({
                userId: 99999,
                resourceId,
                resourceQty: 2,
                bookingDate: '2023-10-10',
                amount: 200,
                bookingType: enums_1.BookingType.TWO_HOUR,
                timeSlot: enums_1.TimeSlots.SLOT_10_12,
                mode: 'online',
                transactionId: 'txn123',
            });
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('No block found for the given key.');
        }));
    });
});
