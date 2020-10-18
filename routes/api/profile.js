const { Router } = require('express');
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator/check');
const config = require("config");
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { findOneAndRemove, remove } = require('../../models/Profile');

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user' ['user', 'name', 'avatar']);

        if(!profile){
            return res.status('400').json({ "msg" : config.get("noProfileError") });
        }

        res.json({ profile })
    }catch(err){
        console.log(err.message);
        res.status('500').send(config.get("serverError"));
    }
});

// @route   POST api/profile
// @desc    Create profile
// @access  Private
router.post('/', [auth,
    [
    check('status', 'O status é obrigatório')
        .not()
        .isEmpty(),

    check('skills', "As habilidades são obrigatórias")
        .not()
        .isEmpty()
    ]
], async (req, res) =>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        res.status('400').json({ errors: errors.array() });
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;

    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;

    if(skills){
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    // Build social object
    profileFields.social = {};
    if(facebook) profileFields.social.facebook = facebook;
    if(youtube) profileFields.social.youtube = youtube;
    if(twitter) profileFields.social.twitter = twitter;
    if(instagram) profileFields.social.instagram = instagram;
    if(linkedin) profileFields.social.linkedin = linkedin;

    try {
        let profile = await Profile.findOne({ user: req.user.id});

        if(profile){
            // Update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                {$set : profileFields},
                {new: true});

            return res.json({ profile });
        }

        //Create
        profile = new Profile(profileFields);
        await profile.save();
        res.json({ profile });

    }catch(err){
        console.log(err);
        res.status('500').send(config.get("serverError"));
    }
});

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
    try {
        const profile = await Profile.find().populate('user', ['name', 'avatar']);
        res.json({ profile })
    }catch(err){
        console.log(err.message)   ;
        res.status('500').send(config.get("serverError"));
    }
});


// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne( {user: req.params.user_id} ).populate('user', ['name', 'avatar']);

        if(!profile){
            return res.status('400').send(config.get("noProfileError"));
        }

        res.json({ profile })
    }catch(err){
        console.log(err.message);

        if(err.kind == 'ObjectId'){
            return res.status('400').send(config.get("noProfileError"));
        }

        res.status('500').send(config.get("serverError"));
    }
});

// @route   DELETE api/profile
// @desc    Delete profile, user and post
// @access  Private
router.delete('/', auth, async (req, res) => {
    try {
        // @todo remove user posts

        // Remove profile
        await Profile.findOneAndRemove({ user: req.user.id });
        
        // Remove user 
        await User.findOneAndRemove({ _id:req.user.id });

        res.json({ "msg":  config.get("deletedUser")});
    }catch(err){
        console.log(err.message)   ;
        res.status('500').send(config.get("serverError"));
    }
});

// @route   PUT api/profile/experience
// @desc    Add profile experiences
// @access  Private
router.put('/experience', [auth, [
    check('title', "O título é obrigatório")
        .not()
        .isEmpty(),
    
    check('company', "A empresa é obrigatória")
        .not()
        .isEmpty(),

    check('from', "A data de início é obrigatória")
        .not()
        .isEmpty(),
]], async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        res.status('400').json({ errors: errors.array() });
    }
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description,
    } = req.body;

    const new_exp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education.unshift(new_exp);
        await profile.save();
        res.json({ profile });
    } catch (err) {
        console.log(err.message);
        res.status('500').send(config.get("serverError"));
    }
});

// @route   DELETE api/profile/experience
// @desc    Delete profile experiences
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        
        // Get remove index
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);

        await profile.save();

        res.json({ profile });
    } catch (err) {
        console.log(err);
        res.status('500').send(config.get('serverError'));
    }
});

// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private
router.put('/education', [auth, [
    check('school', "A instituição é obrigatória")
        .not()
        .isEmpty(),
    
    check('degree', "A formação é obrigatória")
        .not()
        .isEmpty(),

    check('fieldofstudy', "O campo de estudo é obrigatório")
        .not()
        .isEmpty(),
]], async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        res.status('400').json({ errors: errors.array() });
    }
    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
    } = req.body;

    const new_edu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education.unshift(new_edu);
        await profile.save();
        res.json({ profile });
    } catch (err) {
        console.log(err.message);
        res.status('500').send(config.get("serverError"));
    }
});

// @route   DELETE api/profile/education
// @desc    Delete profile education
// @access  Private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        
        // Get remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);

        await profile.save();

        res.json({ profile });
    } catch (err) {
        console.log(err);
        res.status('500').send(config.get('serverError'));
    }
});

module.exports = router;