const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../models/User')

class UserController{
	async index(req, res) {
		 try{
	        const users = await User.find();
	        res.json({ users });
	    }catch(err){
	        console.log(err);
	        res.status('500').send(config.get("errors.server"));
	    }
	}

	async create(req, res){
		const {name, email, password, permissions} = req.body;

		try{

		    let user = await User.findOne({email });

		    if(user){
		        return res.status(400).json({ errors: [{"msg" : "Já existe um usuário cadastrado com este email."}] });
		    }


		    user = new User({
		        name, 
		        email,
		        password,
		        permissions
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
	}

	async delete(req, res){
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
	}

	async update(req, res){
		try {
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
	                email: req.body.email ? req.body.email : user.email,
	                permissions: req.body.permissions ? req.body.permissions : user.permissions,
	            },
	            {
	                new: true,
	                select: '-password',
	                populate: 'permissions'
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
	}

	async update_password(req, res){
		try {
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
	}
}

module.exports = new UserController();