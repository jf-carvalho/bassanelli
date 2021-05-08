const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

exports.create = [
	auth,
    check('name', 'O nome é obrigatório.')
    	.not()
	    .isEmpty(),

	check('name', 'O nome deve conter entre 3 e 75 caracteres.')
		.isLength({min:3, max: 75}),

    (req, res, next)     => {
    	const errors = validationResult(req);
	    if (!errors.isEmpty()) {
	        return res.status(400).json({ errors: errors.array() });
	    }
	    next()
    }
]

exports.update = [
	auth,
    check('name', 'O nome é obrigatório.')
    	.not()
	    .isEmpty(),

	check('name', 'O nome deve conter entre 3 e 75 caracteres.')
		.isLength({min:3, max: 75}),

    (req, res, next)     => {
    	const errors = validationResult(req);
	    if (!errors.isEmpty()) {
	        return res.status(400).json({ errors: errors.array() });
	    }
	    next()
    }
]