const express = require('express');
const router = express.Router();
const auth = require("../middleware/auth");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');
const async = require('async')
const crypto = require('crypto');
const SMTP = require('../config/smtp')

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
		try{
			res.clearCookie('jwt');
			return res.status('200').send('JWT cleaned out!');
		}catch(err){
			res.status(500).send(config.get("errors.server"));
			console.log(err.message)
		}
	}

	async forgot_password(req, res){

		async.waterfall([
		  function(done) {
		    User.findOne({
		      email: req.body.email
		    }).exec(function(err, user) {
		      if (user) {
		        done(err, user);
		      } else {
		        done('Usuário não enconrado.');
		      }
		    });
		  },
		  function(user, done) {
		    // create the random token
		    crypto.randomBytes(20, function(err, buffer) {
		      var token = buffer.toString('hex');
		      done(err, user, token);
		    });
		  },
		  function(user, token, done) {
		    User.findByIdAndUpdate({ _id: user._id }, { reset_password_token: token}, { upsert: true, new: true }).exec(function(err, new_user) {
		      done(err, token, new_user);
		    });
		  },
		  function(token, user, done) {
		    var data = {
		      to: user.email,
		      from: SMTP.auth.user,
		      text: 'Acesse o link para redefinir sua senha: http://localhost:5000/api/auth/reset_password/' + token,
		      subject: 'APPNAME - Redefina sua senha',
		    };

		    mail_transporter.sendMail(data, function(err) {
		      if (!err) {
		        return res.json({ message: 'Verifique seu email e siga as instruções para redefinir sua senha.' });
		      } else {
		        return done(err);
		      }
		    });
		  }
		], function(err) {
		  return res.status(422).json({ message: err });
		});
	}

	async reset_password(req, res){
		let user = await User.findOne({
		    reset_password_token: req.params.token,
		})

		if (user) {
		  if (req.body.new_password === req.body.confirm_password) {

		  	user = await User.findOneAndUpdate(
	            {
	                _id: user._id
	            },
	            {
	                password: bcrypt.hashSync(req.body.new_password, 10),
					reset_password_token: null,
					reset_password_expires: null,
	            }
	        );

		  	return res.status(200).send("Sua senha foi redefinida!");
		    
		  } else {
		    return res.status(422).send({
		      message: 'As senhas não são iguais.'
		    });
		  }
		} else {
		  return res.status(400).send({
		    message: 'Token de redefinição inválido. Tente novamente.'
		  });
		}
	}
}

module.exports = new AuthController();