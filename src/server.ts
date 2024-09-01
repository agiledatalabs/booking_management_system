import 'tsconfig-paths/register';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import routes from '@/routes/routes';
import adminRoutes from '@/routes/adminRoutes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '@/swaggerConfig';
import { authenticateToken, checkAdmin } from './middleware/auth';
import {
  apiErrorHandler,
  uiErrorHandler,
  globalErrorHandler,
} from './middleware/errorHandlers';

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS
const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow requests from the same origin, regardless of port
    if (!origin || origin.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS, cannot access from: ' + origin));
    }
  },
};

app.use(cors(corsOptions));

// Serve static files
app.use(express.static(path.join(__dirname, 'build')));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Apply authenticateToken middleware to all routes except login and register
app.use(
  authenticateToken.unless({
    path: [
      { url: '/api/login', methods: ['POST'] },
      { url: '/api/register', methods: ['POST'] },
    ],
  })
);

// api docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Admin routes
app.use('/api/admin', checkAdmin, adminRoutes);

// API routes
app.use('/api', routes);

// Error handling
app.use('/api', apiErrorHandler);

// UI react frontend
// Error handling
app.use(uiErrorHandler);

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

app.use(globalErrorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
