import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import resourceRoutes from './routes/resourceRoutes';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', resourceRoutes);
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/index.html'))
})
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
