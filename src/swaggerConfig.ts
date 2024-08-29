import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Booking Management System API',
            version: '1.0.0',
            description: 'API documentation for the Booking Management System',
        },
        servers: [
            {
              url: '/api', // Use a relative path for the base URL
              description: 'API server',
            },
          ],
    },
    apis: ["./src/controllers/*.ts"], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;