const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const config = require('config');
var path = require('path');

const Permission = require('../models/Permission')

class PermissionController{
	async index(req, res) {
		 try{
	        const Permissions = await Permission.find();
	        res.json({ Permissions });
	    }catch(err){
	        console.log(err);
	        res.status('500').send(config.get("errors.server"));
	    }
	}
}

module.exports = new PermissionController();
