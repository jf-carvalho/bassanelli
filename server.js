const express = require('express');
const connectDB = require('./config/db')

const app = new express();

//Connect DB
connectDB()

// Init middleware
// With that, I'm able to get request bodies (data) in POST requests
app.use(express.json({extended: false}));

app.get('/', (req, res) => res.send('API Running'));

// Define routes
app.use('/api/user', require('./routes/api/user'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/setting', require('./routes/api/setting'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
