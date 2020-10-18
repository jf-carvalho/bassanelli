const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator/check');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../../models/User')

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post('/', [
    check('name', 'O nome é obrigatório.')
        .not()
        .isEmpty(),

    check('email', 'Por favor, preencha com um email válido.')
        .isEmail(),
        
    check('password', 'Por favor, preencha uma senha de, no mínimo, 8 caracteres')
        .isLength({
            min: 8
        })
], async (req, res) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const {name, email, password} = req.body;

    try{

        let user = await User.findOne({email });

        if(user){
            return res.status(400).json({ errors: [{"msg" : config.get("notUniqueUserError")}] });
        }

        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        });

        user = new User({
            name, 
            email,
            password,
            avatar
        })

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();
    
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

// @route   GET api/users
// @desc    Get all users
// @access  Public
router.get('/', async (req, res) =>{
    try{
        const users = await User.find();
        res.json({ users });
    }catch(err){
        console.log(err);
        res.status('500').send(config.get("serverError"));
    }
});

module.exports = router;