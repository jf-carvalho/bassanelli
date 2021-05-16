const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

exports.create = [
	auth,
    check('name', 'O título do post é obrigatório.')
    	.not()
	    .isEmpty(),

	check('name', 'O título deve conter entre 3 e 50 caracteres.')
		.isLength({min:3, max: 50}),

    check('author', 'O autor do post é obrigatório.')
    	.not()
	    .isEmpty(),

	check('name', 'O autor deve conter entre 3 e 50 caracteres.')
		.isLength({min:3, max: 50}),

    check('content', 'O conteúdo do post é obrigatório.')
    	.not()
	    .isEmpty(),

	check('content', 'O conteúdo deve conter, no mínimo, 20 caracteres.')
		.isLength({min:20}),

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

	check('name', 'O título deve conter entre 3 e 50 caracteres.')
		.isLength({min:3, max: 50}).optional(),


	check('name', 'O autor deve conter entre 3 e 50 caracteres.')
		.isLength({min:3, max: 50}).optional(),

	check('content', 'O conteúdo deve conter, no mínimo, 20 caracteres.')
		.isLength({min:20}).optional(),

    (req, res, next)     => {
    	const errors = validationResult(req);
	    if (!errors.isEmpty()) {
	        return res.status(400).json({ errors: errors.array() });
	    }
	    next()
    }
]