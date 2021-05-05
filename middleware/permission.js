const User = require('../models/User')
const Permission = require('../models/Permission')
const config = require('config');

module.exports = function(PERMISSION_NAME){
    return async (req, res, next) => {
        try{
            let user = await User.findById(req.user.id).populate('permissions');

            let names = []
            user.permissions.map(permission => names.push(permission.name))

            if(!names.includes(PERMISSION_NAME)){
                return res.status('403').send(config.get('errors.unauthorized'))
            }

            next();
        }catch(err){
            res.status('500').json({ "msg" : config.get('errors.server') });
        }
    }
}