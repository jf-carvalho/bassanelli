const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

exports.create = [
	check('name', 'O nome é obrigatório.')
	    .not()
	    .isEmpty(),

	check('email', 'Por favor, preencha com um email válido.')
	    .isEmail(),
	    
	check('password', 'Por favor, preencha uma senha de, no mínimo, 8 caracteres.')
	    .isLength({
	        min: 8
	    }),

	check('password_confirmation', 'As senhas não correspondem.')
		.not()
		.isEmpty()
		.custom((value,{req}) => req.body.password == value),
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next()
}]

exports.update = [
	auth,
    check('email', 'Por favor, preencha com um email válido.')
		.isEmail(),
    (req, res, next)     => {
    	const errors = validationResult(req);
	    if (!errors.isEmpty()) {
	        return res.status(400).json({ errors: errors.array() });
	    }
	    next()
    }
]

exports.update_password = [
	auth, 
    check('password', 'Por favor, preencha uma senha de, no mínimo, 8 caracteres.')
        .isLength({
            min: 8
        }),

    check('password_confirmation', 'As senhas não correspondem.')
        .not()
        .isEmpty()
        .custom((value,{req}) => req.body.password == value),
    (req, res, next) => {
    	const errors = validationResult(req);
	    if (!errors.isEmpty()) {
	        return res.status(400).json({ errors: errors.array() });
	    }
	    next()
    }
]