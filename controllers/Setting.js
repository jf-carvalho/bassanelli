const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const config = require('config');

const Setting = require('../models/Setting')

class SettingController{
	async index(req, res) {
		 try{
	        const users = await User.find();
	        res.json({ users });
	    }catch(err){
	        console.log(err);
	        res.status('500').send(config.get("errors.server"));
	    }
	}
}

module.exports = new SettingController();
