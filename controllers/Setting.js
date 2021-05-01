const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const config = require('config');
var path = require('path');

const Setting = require('../models/Setting')

class SettingController{
	async index(req, res) {
		 try{
	        const settings = await Setting.find();
	        res.json({ settings });
	    }catch(err){
	        console.log(err);
	        res.status('500').send(config.get("errors.server"));
	    }
	}

	async update(req, res){
		try {
	        let setting = await Setting.findById(req.params.id);

	        if(!setting){
	            return res.status('404').send({ msg: "Configuração não encontrada." });
	        }

	        let file = await getfile(setting, req, res)

	        if(file){
	        	req.body.value = file
	        }

	        setting = await Setting.findOneAndUpdate(
	            {
	                _id: req.params.id
	            },
	            {
	                value: req.body.value ? req.body.value : ""
	            },
	            {
	                new: true
	            }
	        );

	        return res.json(setting);

	    } catch (err) {
	        console.log(err.message);

	        if(err.kind === 'ObjectId'){
	            return res.status('404').send({ msg: "Configuração não encontrada." });
	        }

	        res.status('500').send(config.get("errors.server"))
	    }
	}
}

async function getfile(setting, req, res){
	if(setting.key === 'primary_logo' || setting.key === 'secondary_logo'){
	 	if (!req.files || Object.keys(req.files).length === 0) {
		    return res.status(400).send('Nenhum arquivo encontrado.');
		}

		const basepath = (path.dirname(require.main.filename || process.mainModule.filename))

		let file = req.files.value;

		if(!["image/gif", "image/jpeg", "image/png", "image/webp"].includes(file.mimetype)){
			return res.status(400).send('Tipo inválido de arquivo. Extensões suportadas: PNG, JPG, GIF e WEBP.');
		}

		let relative = "/storage/images/" + setting._id + '.' +  file.name.split('.')[1];
		let uploadPath = basepath + relative;

		file.mv(uploadPath, function(err) {
		  	if (err)
		    	return res.status(500).send(err);
		});

		return relative;
	}
}

module.exports = new SettingController();
