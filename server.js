const express = require('express');
const connectDB = require('./config/db')
const fileUpload = require('express-fileupload');
const nodemailer = require('nodemailer')
const SMTP = require('./config/smtp')

const app = new express();

//Connect DB
connectDB()

app.use(fileUpload());

global.mail_transporter = nodemailer.createTransport(SMTP)

// Init middleware
// With that, I'm able to get request bodies (data) in POST requests
app.use(express.json({extended: false}));

app.get('/', (req, res) => res.send('API Running'));

// Define routes
app.use('/api/user', require('./routes/api/user'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/setting', require('./routes/api/setting'));
app.use('/api/permission', require('./routes/api/permission'));
app.use('/api/service_category', require('./routes/api/service_category'));
app.use('/api/testimonial', require('./routes/api/testimonial'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
