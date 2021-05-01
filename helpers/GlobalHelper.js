const Setting = require('../models/Setting')

exports.setting = async function setting(key){
	let setting = await Setting.findOne({ key });
	return setting ? setting.value : null;
}