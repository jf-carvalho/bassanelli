const jwt = require('jsonwebtoken');
const config = require('config');

 module.exports = function(req, res, next){
    
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if known token
    if(!token){
        return res.status(401).json({ "msg" : config.get("noTokenError") });
    }

    // Verify token
    try{
        const decoded = jwt.verify(token, config.get('jwtSecret'));

        req.user = decoded.user;
        next();
    }catch(err){
        res.status('401').json({ "msg" : config.get('invalidTokenError') });
    }

 }