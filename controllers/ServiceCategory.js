const config = require('config');
const ServiceCategory = require('../models/ServiceCategory')
const slugify = require('slug')

class ServiceCategoryController {
	async index(req, res){
		try{
	        const service_categories = await ServiceCategory.find();
	        res.json({ service_categories });
	    }catch(err){
	        console.log(err);
	        res.status('500').send(config.get("errors.server"));
	    }
	}

	async create(req, res){
	    const {name, parent} = req.body;

		try{

		    let category = await ServiceCategory.findOne({name });

		    if(category){
		        return res.status(400).json({ errors: [{"msg" : "Já existe uma categoria de serviço cadastrada com este nome."}] });
		    }

		    let slug = slugify(name, '-')

		    category = new ServiceCategory({
		        name, 
		        slug,
		        parent
		    })

		    await category.save();
		

		   res.json(category)


		}catch(err){
		    console.log(err);
		    res.status(500).send(config.get("errors.server"));
		}
	}

	async delete(req, res){
		try {

	        const category = await ServiceCategory.findById(req.params.id);

	        if(!category){
	            return res.status('404').send({ msg: "Categoria de serviço não encontrada." });
	        }

	        await category.remove();

	        res.json({ msg: "Categoria de serviço excluída." });

	    } catch (err) {
	        console.log(err.message);

	        if(err.kind === 'ObjectId'){
	            return res.status('404').send({ msg: "Categoria de serviço não encontrada." });
	        }

	        res.status('500').send(config.get("errors.server"));
	    }
	}

	async update(req, res){
		const {name, parent} = req.body;
		
		try {
	        let category = await ServiceCategory.findById(req.params.id);

	        if(!category){
	            return res.status('404').send({ msg: "Categoria de serviço não encontrada." });
	        }

	        let other_category = await ServiceCategory.findOne({name });

		    if(other_category && other_category._id !== req.params.id){
		        return res.status(400).json({ errors: [{"msg" : "Já existe uma categoria de serviço cadastrada com este nome."}] });
		    }

	        category = await ServiceCategory.findOneAndUpdate(
	            {
	                _id: req.params.id
	            },
	            {
	                name: name ? name : category.name,
	                slug: name ? slugify(name, '-') : category.slug,
	                parent: parent ? parent : (category.parent ? category.parent : null)
	            },
	            {
	                new: true
	            }
	        );

	        return res.json(category);

	    } catch (err) {
	        console.log(err.message);

	        if(err.kind === 'ObjectId'){
	            return res.status('404').send({ msg: "Categoria de serviço não encontrada." });
	        }

	        res.status('500').send(config.get("errors.server"))
	    }
	}
}

module.exports = new ServiceCategoryController();