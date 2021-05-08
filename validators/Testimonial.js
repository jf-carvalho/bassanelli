const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

exports.create = [
	auth,
    check('message', 'A mensagem é obrigatória.')
    	.not()
	    .isEmpty(),

	check('message', 'A mensagem deve conter entre 15 e 900 caracteres.')
		.isLength({min:15, max: 900}),

	check('customer', 'O nome do cliente é obrigatório.')
    	.not()
	    .isEmpty(),

	check('customer', 'O nome do cliente deve conter entre 3 e 50 caracteres.')
		.isLength({min:3, max: 50}),

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
    check('message', 'A mensagem é obrigatória.')
    	.not()
	    .isEmpty(),

	check('message', 'A mensagem deve conter entre 15 e 900 caracteres.')
		.isLength({min:15, max: 900}),

	check('customer', 'O nome do cliente é obrigatório.')
    	.not()
	    .isEmpty(),

	check('customer', 'O nome do cliente deve conter entre 3 e 50 caracteres.')
		.isLength({min:3, max: 50}),

    (req, res, next)     => {
    	const errors = validationResult(req);
	    if (!errors.isEmpty()) {
	        return res.status(400).json({ errors: errors.array() });
	    }
	    next()
    }
]