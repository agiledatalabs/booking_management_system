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
const resourceController_1 = require("@/controllers/resourceController");
const enums_1 = require("@/shared/enums");
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post('/resources', resourceController_1.addResource);
app.get('/resources', resourceController_1.getResources);
app.put('/resources/:id', resourceController_1.editResource);
app.put('/resources/:id/status', resourceController_1.updateResourceStatus);
app.delete('/resources/:id', resourceController_1.deleteResource);
describe('Resource Controller', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Setup: Clear the database or create necessary test data
        yield prisma.resource.deleteMany({});
        yield prisma.resourceType.deleteMany({});
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Cleanup: Close the Prisma Client connection
        yield prisma.resource.deleteMany({});
        yield prisma.resourceType.deleteMany({});
        yield prisma.$disconnect();
    }));
    describe('POST /resources', () => {
        let resourceTypeId;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            // Setup: Clear the database and create a resource type
            yield prisma.resourceType.deleteMany({});
            const resourceType = yield prisma.resourceType.create({
                data: { name: 'TestType' },
            });
            resourceTypeId = resourceType.id;
        }));
        it('should create a new resource', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/resources')
                .send({
                name: 'NewResource',
                resourceTypeId,
                maxQty: 10,
                priceInternal: 100,
                priceExternal: 150,
                bookingType: enums_1.BookingType.TWO_HOUR,
                active: true,
            });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('name', 'NewResource');
            // Verify the resource was created in the database
            const resource = yield prisma.resource.findUnique({
                where: { name: 'NewResource' },
            });
            expect(resource).not.toBeNull();
            expect(resource === null || resource === void 0 ? void 0 : resource.name).toBe('NewResource');
        }));
        it('should return 400 if required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/resources')
                .send({});
            expect(response.status).toBe(400);
            expect(response.body.error).toContain(' is required');
        }));
        it('should return 400 if bookingType is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/resources')
                .send({
                name: 'InvalidResource',
                resourceTypeId,
                maxQty: 10,
                priceInternal: 100,
                priceExternal: 150,
                bookingType: 'INVALID',
                active: true,
            });
            expect(response.status).toBe(400);
            expect(response.body.error).toContain('Invalid bookingType');
        }));
    });
    describe('GET /resources', () => {
        let resourceTypeId;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            // Setup: Clear the database and create resources
            yield prisma.resource.deleteMany({});
            yield prisma.resourceType.deleteMany({});
            const resourceType = yield prisma.resourceType.create({
                data: { name: 'TestType' },
            });
            resourceTypeId = resourceType.id;
            yield prisma.resource.createMany({
                data: [
                    {
                        name: 'Resource1',
                        resourceTypeId,
                        maxQty: 10,
                        priceInternal: 100,
                        priceExternal: 150,
                        bookingType: enums_1.BookingType.TWO_HOUR,
                        active: true,
                    },
                    {
                        name: 'Resource2',
                        resourceTypeId,
                        maxQty: 5,
                        priceInternal: 50,
                        priceExternal: 75,
                        bookingType: 'DAILY',
                        active: false,
                    },
                ],
            });
        }));
        it('should retrieve all resources by resource type ID', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/resources')
                .query({ resourceTypeId });
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(response.body).toEqual(expect.arrayContaining([
                expect.objectContaining({ name: 'Resource1' }),
                expect.objectContaining({ name: 'Resource2' }),
            ]));
        }));
        it('should return 400 if resourceTypeId is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/resources')
                .query({});
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('resourceTypeId cannot be blank');
        }));
    });
    describe('PUT /resources/:id', () => {
        let resourceId;
        let resourceTypeId;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            // Setup: Clear the database and create a resource type and resource
            yield prisma.resource.deleteMany({});
            yield prisma.resourceType.deleteMany({});
            const resourceType = yield prisma.resourceType.create({
                data: { name: 'TestType' },
            });
            resourceTypeId = resourceType.id;
            const resource = yield prisma.resource.create({
                data: {
                    name: 'ResourceToEdit',
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
        it('should edit a resource', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .put(`/resources/${resourceId}`)
                .send({ name: 'UpdatedResource' });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('name', 'UpdatedResource');
            // Verify the resource was updated in the database
            const resource = yield prisma.resource.findUnique({
                where: { id: resourceId },
            });
            expect(resource).not.toBeNull();
            expect(resource === null || resource === void 0 ? void 0 : resource.name).toBe('UpdatedResource');
        }));
        it('should return 400 if no fields are provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .put(`/resources/${resourceId}`)
                .send({});
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('At least one field is required to update the resource.');
        }));
        it('should return 404 if resource not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .put('/resources/99999')
                .send({ name: 'UpdatedResource' });
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Resource not found.');
        }));
    });
    describe('PUT /resources/:id/status', () => {
        let resourceId;
        let resourceTypeId;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            // Setup: Clear the database and create a resource type and resource
            yield prisma.resource.deleteMany({});
            yield prisma.resourceType.deleteMany({});
            const resourceType = yield prisma.resourceType.create({
                data: { name: 'TestType' },
            });
            resourceTypeId = resourceType.id;
            const resource = yield prisma.resource.create({
                data: {
                    name: 'ResourceToUpdateStatus',
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
        it('should update the status of a resource', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .put(`/resources/${resourceId}/status`)
                .send({ active: false });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('active', false);
            // Verify the resource status was updated in the database
            const resource = yield prisma.resource.findUnique({
                where: { id: resourceId },
            });
            expect(resource).not.toBeNull();
            expect(resource === null || resource === void 0 ? void 0 : resource.active).toBe(false);
        }));
        it('should return 400 if active status is not provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .put(`/resources/${resourceId}/status`)
                .send({});
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Active status is required.');
        }));
    });
    describe('DELETE /resources/:id', () => {
        let resourceId;
        let resourceTypeId;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            // Setup: Clear the database and create a resource type and resource
            yield prisma.resource.deleteMany({});
            yield prisma.resourceType.deleteMany({});
            const resourceType = yield prisma.resourceType.create({
                data: { name: 'TestType' },
            });
            resourceTypeId = resourceType.id;
            const resource = yield prisma.resource.create({
                data: {
                    name: 'ResourceToDelete',
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
        it('should delete a resource', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .delete(`/resources/${resourceId}`);
            expect(response.status).toBe(204);
            // Verify the resource was deleted in the database
            const resource = yield prisma.resource.findUnique({
                where: { id: resourceId },
            });
            expect(resource).toBeNull();
        }));
        it('should return 404 if resource not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .delete('/resources/99999');
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Resource not found');
        }));
    });
});
