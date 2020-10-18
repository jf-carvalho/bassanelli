const express = require('express');
const router = express.Router();
const auth = require("../../middleware/auth");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator/check');

const User = require('../../models/User');

// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }catch(err){
        console.log(err.message);
        res.status('500').send(config.get("serverError"));
    }
});

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public
router.post('/', 
[
    check('email', 'Por favor, preencha com um email válido.')
        .isEmail(),
        
    check('password', 'Por favor, preencha sua senha.')
        .exists()
], async (req, res) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const { email, password } = req.body;

    try{

        let user = await User.findOne({ email });

        if(!user){
            return res.status(400).json({ errors: [{"msg" : config.get("invalidAccountError")}] });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            res.json({ errors: [{ "msg" : config.get("invalidAccountError") }] });
        }

        const payload = {
            user: {
                "id": user.id
            }
        }

        jwt.sign(
            payload,
            config.get("jwtSecret"),
            { expiresIn: 360000 },
            (err, token) => {
                if(err) throw err;
                res.json({ token });
            }
        );


    }catch(err){
        console.log(err);
        res.status(500).send(config.get("serverError"));
    }

});

module.exports = router;