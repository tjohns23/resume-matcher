const express = require('express');
const cors = require('cors');
const matchRoute = require('./routes/match');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', matchRoute);

app.listen(3001, () => console.log('Server running on http://localhost:3001'));

