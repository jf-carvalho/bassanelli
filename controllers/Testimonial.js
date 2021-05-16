const config = require('config');

const Testimonial = require('../models/Testimonial')

class TestimonialController{
	async index(req, res) {
		const deleted = req.params.deleted ? true : false;

		if(deleted && req.params.deleted  !== 'deleted' && req.params.deleted  !== 'with_deleted'){
			res.status(500).send("Parâmetro inválido.");
		}

		try{
			let testimonials;

			switch(req.params.deleted) {
				case 'deleted':
					testimonials = await Testimonial.find({'deleted_at': {$ne: null}}).sort({'created_at': -1});
					break;
				case 'with_deleted':
					testimonials = await Testimonial.find().sort({'created_at': -1});
					break;
				default:
					testimonials = await Testimonial.find({'deleted_at': null}).sort({'created_at': -1});
					break;
			}

			res.json({testimonials})
		}catch(err){
			console.log(err.message)
			res.status(500).send(config.get("errors.server"));
		}

	}

	async create(req, res) {
		const {message, customer} = req.body;

		try {
			let testimonial = new Testimonial({
				message: message,
				customer: customer
			});

			await testimonial.save()

			res.json(testimonial)

		} catch(err) {
			console.log(err.message);
		    res.status(500).send(config.get("errors.server"));
		}
	}

	async update(req, res){
		const {message, customer} = req.body;

		try {
			let testimonial = await Testimonial.findById(req.params.id);

			if(!testimonial){
				res.status(404).send({ msg: "Depoimento não encontrado." })
			}

			testimonial = await Testimonial.findOneAndUpdate(
				{
					_id: req.params.id
				},
				{
					message: message ? message : testimonial.message,
					customer: customer ? customer : testimonial.customer,
					updated_at: Date.now()
				},
				{
					new: true
				}
			)

			res.json(testimonial)

		} catch(err) {
			console.log(err.message);

			if(err.kind === 'ObjectId'){
	            return res.status('404').send({ msg: "Depoimento não encontrado." });
	        }

		    res.status(500).send(config.get("errors.server"));
		}
	}

	async delete(req, res) {
		const hard = req.params.hard ? true : false;

		if(hard && req.params.hard !== 'hard'){
			res.status('500').send("Parâmetro inválido.");
		}

		try {
			let testimonial = await Testimonial.findById(req.params.id);

			if(!testimonial){
				res.status(404).send({ msg: "Depoimento não encontrado." })
			}

			if(hard){
				await testimonial.remove();
			}else{
				testimonial = await Testimonial.findOneAndUpdate(
					{
						_id: req.params.id
					},
					{
						deleted_at: Date.now()
					}
				)
			}

		    res.json({ msg: "Depoimento excluído." });
		} catch(e) {
			console.log(err.message);

	        if(err.kind === 'ObjectId'){
	            return res.status('404').send({ msg: "Depoimento não encontrado." });
	        }

	        res.status('500').send(config.get("errors.server"));
		}
	}

	async recover(req, res){
		try {
			let testimonial = await Testimonial.findById(req.params.id);

			if(!testimonial){
				return res.status(404).send({ msg: "Depoimento não encontrado." })
			}

			if(testimonial.deleted_at === null || !testimonial.deleted_at){
	        	return res.status('400').send("Este depoimento já está ativo e não precisa ser recuperado.")
	        }

			testimonial = await Testimonial.findOneAndUpdate(
				{
					_id: req.params.id
				},
				{
					deleted_at: null
				},
				{
					new: true
				}
			)

			res.json(testimonial)

		} catch(err) {
			console.log(err.message);

			if(err.kind === 'ObjectId'){
	            return res.status('404').send({ msg: "Depoimento não encontrado." });
	        }

		    res.status(500).send(config.get("errors.server"));
		}
	}
}


module.exports = new TestimonialController();
