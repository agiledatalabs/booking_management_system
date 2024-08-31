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
const resourceTypeController_1 = require("@/controllers/resourceTypeController");
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get('/resourceTypes', resourceTypeController_1.getResourceTypes);
app.post('/resourceTypes', resourceTypeController_1.addResourceType);
app.delete('/resourceTypes/:id', resourceTypeController_1.deleteResourceType);
app.put('/resourceTypes/:id', resourceTypeController_1.editResourceType);
describe('ResourceType Controller', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Setup: Clear the database or create necessary test data
        yield prisma.resourceType.deleteMany({});
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Cleanup: Close the Prisma Client connection
        yield prisma.resourceType.deleteMany({});
        yield prisma.$disconnect();
    }));
    describe('POST /resourceTypes', () => {
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            // Setup: Clear the database and create a resource type
            yield prisma.resourceType.deleteMany({});
            yield prisma.resourceType.create({
                data: { name: 'ExistingType' },
            });
        }));
        it('should create a new resource type', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/resourceTypes')
                .send({ name: 'NewType' });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('name', 'NewType');
            // Verify the resource type was created in the database
            const resourceType = yield prisma.resourceType.findUnique({
                where: { name: 'NewType' },
            });
            expect(resourceType).not.toBeNull();
            expect(resourceType === null || resourceType === void 0 ? void 0 : resourceType.name).toBe('NewType');
        }));
        it('should return 400 if name is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/resourceTypes')
                .send({});
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Name is required and must not be empty');
        }));
        it('should return 400 if resource type with the same name already exists', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/resourceTypes')
                .send({ name: 'ExistingType' });
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('A resource type with this name already exists');
        }));
    });
    describe('PUT /resourceTypes/:id', () => {
        let resourceTypeId;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            // Setup: Clear the database and create resource types
            yield prisma.resourceType.deleteMany({});
            const resourceType1 = yield prisma.resourceType.create({
                data: { name: 'Type1' },
            });
            yield prisma.resourceType.create({
                data: { name: 'Type2' },
            });
            resourceTypeId = resourceType1.id;
        }));
        it('should edit a resource type', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .put(`/resourceTypes/${resourceTypeId}`)
                .send({ name: 'UpdatedType' });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('name', 'UpdatedType');
            // Verify the resource type was updated in the database
            const resourceType = yield prisma.resourceType.findUnique({
                where: { id: resourceTypeId },
            });
            expect(resourceType).not.toBeNull();
            expect(resourceType === null || resourceType === void 0 ? void 0 : resourceType.name).toBe('UpdatedType');
        }));
        it('should return 400 if name is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .put(`/resourceTypes/${resourceTypeId}`)
                .send({});
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Name is required and must not be empty');
        }));
        it('should return 404 if resource type not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .put('/resourceTypes/99999')
                .send({ name: 'UpdatedType' });
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Resource type not found.');
        }));
    });
    describe('DELETE /resourceTypes/:id', () => {
        let resourceTypeId;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            // Setup: Clear the database and create a resource type
            yield prisma.resourceType.deleteMany({});
            const resourceType = yield prisma.resourceType.create({
                data: { name: 'TypeToDelete' },
            });
            resourceTypeId = resourceType.id;
        }));
        it('should delete a resource type', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .delete(`/resourceTypes/${resourceTypeId}`);
            expect(response.status).toBe(204);
            // Verify the resource type was deleted in the database
            const resourceType = yield prisma.resourceType.findUnique({
                where: { id: resourceTypeId },
            });
            expect(resourceType).toBeNull();
        }));
        it('should return 404 if resource type not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .delete('/resourceTypes/99999');
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Resource type not found.');
        }));
    });
    describe('GET /resourceTypes', () => {
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            // Setup: Clear the database and create resource types
            yield prisma.resourceType.deleteMany({});
            yield prisma.resourceType.createMany({
                data: [
                    { name: 'Type1' },
                    { name: 'Type2' },
                ],
            });
        }));
        it('should retrieve all resource types', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/resourceTypes');
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(response.body).toEqual(expect.arrayContaining([
                expect.objectContaining({ name: 'Type1' }),
                expect.objectContaining({ name: 'Type2' }),
            ]));
        }));
    });
});
