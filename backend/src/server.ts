import express from 'express';
import bodyParser from 'body-parser';
import resourceRoutes from './routes/resourceRoutes';

const app = express();
const port = process.env.PORT || 3001;

// Configure multer to store files in memory

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', resourceRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});