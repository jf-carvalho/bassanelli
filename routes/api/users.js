const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../../middleware/auth');

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
        
    check('password', 'Por favor, preencha uma senha de, no mínimo, 8 caracteres.')
        .isLength({
            min: 8
        }),

    check('password_confirmation', 'As senhas não correspondem.')
        .not()
        .isEmpty()
        .custom((value,{req}) => req.body.password == value)

], async (req, res) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const {name, email, password} = req.body;

    try{

        let user = await User.findOne({email });

        if(user){
            return res.status(400).json({ errors: [{"msg" : config.get("errors.not_unique_user")}] });
        }


        user = new User({
            name, 
            email,
            password,
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
        res.status(500).send(config.get("errors.server"));
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
        res.status('500').send(config.get("errors.server"));
    }
});

// @route   DELETE api/users/:id
// @desc    Delete user by ID
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {

        const user = await User.findById(req.params.id);

        if(!user){
            return res.status('404').send({ msg: "Usuário não encontrado." });
        }

        // Check user
        if(user.id.toString() !== req.user.id){
            return res.status('401').send({ msg: config.get("errors.unauthorized") });
        }

        await user.remove();

        res.json({ msg: "Usuário excluído." });

    } catch (err) {
        console.log(err.message);

        if(err.kind === 'ObjectId'){
            return res.status('404').send({ msg: "Usuário não encontrado." });
        }

        res.status('500').send(config.get("errors.server"));
    }
});

// @route   UPDATE api/users/:id
// @desc    Update user by ID
// @access  Private
router.put('/:id', [
    auth,
        [
            check('email', 'Por favor, preencha com um email válido.')
                .isEmail(),
        ]
    ],  async (req, res) => {
    try {
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            res.status('400').json({ errors: errors.array() });
        }

        let user = await User.findById(req.params.id);

        if(!user){
            return res.status('404').send({ msg: "Usuário não encontrado." });
        }

        // Check user
        if(user.id.toString() !== req.user.id){
            return res.status('401').send({ msg: config.get("errors.unauthorized") });
        }

        user = await User.findOneAndUpdate(
            {
                _id: req.params.id
            },
            {
                name: req.body.name ? req.body.name : user.name,
                email: req.body.email ? req.body.email : user.email
            },
            {
                new: true
            }
        );

        return res.json(user);

    } catch (err) {
        console.log(err.message);

        if(err.kind === 'ObjectId'){
            return res.status('404').send({ msg: "Usuário não encontrado." });
        }

        res.status('500').send(config.get("errors.server"))
    }
});

// @route   UPDATE api/users/:id
// @desc    Update user by ID
// @access  Private
router.put('/password/:id', [
    auth,
        [
            check('password', 'Por favor, preencha uma senha de, no mínimo, 8 caracteres.')
                .isLength({
                    min: 8
                }),

            check('password_confirmation', 'As senhas não correspondem.')
                .not()
                .isEmpty()
                .custom((value,{req}) => req.body.password == value)
        ]
    ],  async (req, res) => {
    try {
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            res.status('400').json({ errors: errors.array() });
        }

        let user = await User.findById(req.params.id);

        if(!user){
            return res.status('404').send({ msg: "Usuário não encontrado." });
        }

        // Check user
        if(user.id.toString() !== req.user.id){
            return res.status('401').send({ msg: config.get("errors.unauthorized") });
        }

        const salt = await bcrypt.genSalt(10);

        const password = await bcrypt.hash(req.body.password, salt);

        user = await User.findOneAndUpdate(
            {
                _id: req.params.id
            },
            {
                password: password
            },
            {
                new: true
            }
        );

        return res.json(user);

    } catch (err) {
        console.log(err.message);

        if(err.kind === 'ObjectId'){
            return res.status('404').send({ msg: "Usuário não encontrado." });
        }

        res.status('500').send(config.get("errors.server"))
    }
});

module.exports = router;