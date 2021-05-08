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
	        let permissions = await Permission.find().sort({'group' : 1}).distinct('group');

	        permissions = await Promise.all(permissions.map(async (name) => {
	        	let group = {};

	        	group.group = name;
	        	group.permissions = await Permission.find({'group': name}).sort({'name': -1}).select('-group')

	        	return group;
	        }))

	        res.json({ permissions });
	    }catch(err){
	        console.log(err);
	        res.status('500').send(config.get("errors.server"));
	    }
	}
}


module.exports = new PermissionController();
