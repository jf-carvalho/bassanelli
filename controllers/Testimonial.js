const config = require('config');

const Testimonial = require('../models/Testimonial')

class TestimonialController{
	async index(req, res) {
		try{
			const testimonials = await Testimonial.find();

			res.json(testimonials)
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
					customer: customer ? customer : testimonial.customer
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
		try {
			let testimonial = await Testimonial.findById(req.params.id);

			if(!testimonial){
				res.status(404).send({ msg: "Depoimento não encontrado." })
			}

			await testimonial.remove();

		    res.json({ msg: "Depoimento excluído." });
		} catch(e) {
			console.log(err.message);

	        if(err.kind === 'ObjectId'){
	            return res.status('404').send({ msg: "Depoimento não encontrado." });
	        }

	        res.status('500').send(config.get("errors.server"));
		}
	}
}


module.exports = new TestimonialController();
