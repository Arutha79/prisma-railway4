const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.use('/api', require('./api/zoran'));
app.use('/api', require('./api/polymorphe'));

app.listen(3000, () => console.log('🧠 Serveur Prisma en ligne sur http://localhost:3000'));