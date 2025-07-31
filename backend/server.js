const express = require('express');
const cors = require('cors');
const matchRoute = require('./routes/match');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', matchRoute);

// Use the port Render provides, or 3001 for local development
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));