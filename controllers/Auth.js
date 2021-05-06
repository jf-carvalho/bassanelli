const express = require('express');
const router = express.Router();
const auth = require("../middleware/auth");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');

class AuthController {
	async index(req, res){
		try {
	        const user = await User.findById(req.user.id).select('-password');
	        res.json(user);
	    }catch(err){
	        console.log(err.message);
	        res.status('500').send(config.get("errors.server"));
	    }
	}

	async login(req, res){
	    const { email, password } = req.body;

	    try{

	        let user = await User.findOne({ email });

	        if(!user){
	            return res.status(400).json({ errors: [{"msg" : config.get("errors.invalid_account")}] });
	        }

	        const isMatch = await bcrypt.compare(password, user.password);

	        if(!isMatch){
	            res.json({ errors: [{ "msg" : config.get("errors.invalid_account") }] });
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
	        res.status(500).send(config.get("errors.server"));
	    }
	}

	async logout(req, res){
		return res.cookie('jwt', '', { maxAge: 1 });
	}
}

module.exports = new AuthController();