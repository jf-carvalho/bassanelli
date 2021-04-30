const { check } = require('express-validator');

exports.login = [
	check('email', 'Por favor, preencha com um email válido.')
        .isEmail(),
        
    check('password', 'Por favor, preencha sua senha.')
        .exists(),
(req, res, next) => {
    const errors = check(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next()
}]