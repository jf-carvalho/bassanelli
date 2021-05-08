const { check } = require('express-validator');
const auth = require('../middleware/auth');

exports.create = [
	auth,
    // check()
    (req, res, next)     => {
    	const errors = check(req);
	    if (!errors.isEmpty()) {
	        return res.status(400).json({ errors: errors.array() });
	    }
	    next()
    }
]

exports.update = [
	auth,
    // check()
    (req, res, next)     => {
    	const errors = check(req);
	    if (!errors.isEmpty()) {
	        return res.status(400).json({ errors: errors.array() });
	    }
	    next()
    }
]