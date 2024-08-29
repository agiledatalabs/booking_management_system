import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import resourceRoutes from './routes/resourceRoutes';
import orderRoutes from './routes/orderRoutes';
import userRoutes from './routes/userRoutes';
import messageRoutes from './routes/messageRoutes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swaggerConfig';

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'build')));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API routes
app.use('/api', resourceRoutes);
app.use('/api', orderRoutes);
app.use('/api', userRoutes);
app.use('/api', messageRoutes);

// api docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// react frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/index.html'))
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
