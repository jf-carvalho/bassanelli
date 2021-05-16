const config = require('config');
const slugify = require('slug')
var path = require('path');
const fs = require('fs');

const Post = require('../models/Post');
const { remove } = require('../models/Post');

class PostController{
	async index(req, res) {
		const deleted = req.params.deleted ? true : false;

		if(deleted && req.params.deleted  !== 'deleted' && req.params.deleted  !== 'with_deleted'){
			res.status(500).send("Parâmetro inválido.");
		}

		try{
			let posts;

			switch(req.params.deleted) {
				case 'deleted':
					posts = await Post.find({'deleted_at': {$ne: null}}).sort({'created_at': -1});
					break;
				case 'with_deleted':
					posts = await Post.find().sort({'created_at': -1});
					break;
				default:
					posts = await Post.find({'deleted_at': null}).sort({'created_at': -1});
					break;
			}

			res.json({posts})
		}catch(err){
			console.log(err.message)
			res.status(500).send(config.get("errors.server"));
		}
	}

	async create(req, res) {
		const {name, author, content, tags} = req.body;

        let slug = slugify(name, '-');

		try {

            let thumbnail;
            if(req.files){
                thumbnail = await getfile(req, res);
                if(!thumbnail){
                    return res.status(500).send(config.get("errors.server"));
                }
            }

			let post = await Post.findOne({name });

		    if(post){
		        return res.status(400).json({ errors: [{"msg" : "Já existe um post cadastrado com este título."}] });
		    }

			post = new Post({
				name,
                slug,
                author,
                content,
                thumbnail,
                tags
			});

			await post.save()

			res.json(post)

		} catch(err) {
			console.log(err.message);
		    res.status(500).send(config.get("errors.server"));
		}
	}

	async update(req, res){
		const {name, author, content, tags} = req.body;

		try {
			let post = await Post.findById(req.params.id);

			let other_post = await Post.findOne({name });

		    if(other_post && other_post._id !== req.params.id){
		        return res.status(400).json({ errors: [{"msg" : "Já existe um post cadastrado com este título."}] });
		    }

			let thumbnail = false;
            if(req.files){
				if(post.thumbnail){
					let remove = await removePostThumb(post.thumbnail);
					if(!remove){
						return res.status(500).send("Error deleting thumbnail.")
					}
				}

                thumbnail = await getfile(req, res);
                if(!thumbnail){
                    return res.status(500).send(config.get("errors.server"));
                }
			}

			if(!post){
				res.status(404).send({ msg: "Post não encontrado." })
			}

			post = await Post.findOneAndUpdate(
				{
					_id: req.params.id
				},
				{
					name: name ? name : post.name,
					slug: name ? slugify(name, '-') : post.slug,
					author: author ? author : post.author,
					content: content ? content : post.content,
					thumbnail: thumbnail ? thumbnail : post.thumbnail,
					tags: tags ? tags : post.tags,
					updated_at: Date.now()
				},
				{
					new: true
				}
			)

			res.json(post)

		} catch(err) {
			console.log(err.message);

			if(err.kind === 'ObjectId'){
	            return res.status('404').send({ msg: "Post não encontrado." });
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
			let post = await Post.findById(req.params.id);

			if(!post){
				res.status(404).send({ msg: "Post não encontrado." })
			}

			if(hard){
				if(post.thumbnail){
					let remove = await removePostThumb(post.thumbnail);
					if(!remove){
						return res.status(500).send("Error deleting thumbnail.")
					}
				}
				
				await post.remove();
			}else{
				post = await Post.findOneAndUpdate(
					{
						_id: req.params.id
					},
					{
						deleted_at: Date.now()
					}
				)
			}

		    res.json({ msg: "Post excluído." });
		} catch(e) {
			console.log(err.message);

	        if(err.kind === 'ObjectId'){
	            return res.status('404').send({ msg: "Post não encontrado." });
	        }

	        res.status('500').send(config.get("errors.server"));
		}
	}

	async recover(req, res){
		try {
			let post = await Post.findById(req.params.id);

			if(!post){
				return res.status(404).send({ msg: "Post não encontrado." })
			}

			if(post.deleted_at === null || !post.deleted_at){
	        	return res.status('400').send("Este post já está ativo e não precisa ser recuperado.")
	        }

			post = await Post.findOneAndUpdate(
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

			res.json(post)

		} catch(err) {
			console.log(err.message);

			if(err.kind === 'ObjectId'){
	            return res.status('404').send({ msg: "Post não encontrado." });
	        }

		    res.status(500).send(config.get("errors.server"));
		}
	}
}

async function getfile(req, res){
	const basepath = (path.dirname(require.main.filename || process.mainModule.filename))

	let file = req.files.thumbnail;

	if(!["image/gif", "image/jpeg", "image/png", "image/webp"].includes(file.mimetype)){
		return res.status(400).send('Tipo inválido de arquivo. Extensões suportadas: PNG, JPG, GIF e WEBP.');
	}

    let relative = "/storage/images/posts";

    if (!fs.existsSync(basepath + relative)){
        fs.mkdirSync(basepath + relative, {recursive: true}, err => {});
    }

	let filepath = relative + "/" + (+new Date) + '.' + file.name.split('.')[1];
	let uploadPath = basepath + filepath;

	file.mv(uploadPath, function(err) {
	  	if(err){
              console.log(err)
            return false;
          }
	});

	return filepath;
}

async function removePostThumb(thumb){
	const basepath = (path.dirname(require.main.filename || process.mainModule.filename))

	try {
		fs.unlinkSync(basepath + thumb.replace(new RegExp('/', 'g'), '\\'));
	} catch (err) {
		console.log(err)
		return false;	
	}

	return true;
}

module.exports = new PostController();
