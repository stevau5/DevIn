const express = require("express");
const request = require('request');
const config = require('config');
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require('express-validator/check');


const Profile = require("../../models/Profile");
const User = require("../../models/User");

/** @route GET api/profile/me
 *  @desc get current users profile
 *  @access profile
 */
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({
        msg: "no profile for user"
      });
    }

    res.json(profile);
  } catch (err) {
    console.errpr(err.message);
    res.status(500).send("server Error");
  }
});

/** @route Post api/profile
 *  @desc create or update a user profile
 *  @access priv
 */

router.post('/', [ auth, [
  check('status', 'Status is required')
  .not()
  .isEmpty(), 
  check('skills', 'skills is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({
      errors: errors.array()
    });
  }

    //deconstruction 
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

    // build profile object. 

    const profileFields = {};
    profileFields.user = req.user.id; 
    if(company) profileFields.company = company; 
    if(website) profileFields.website = website; 
    if(location) profileFields.location = location; 
    if(bio) profileFields.bio = bio; 
    if(status) profileFields.status = status; 
    if(githubusername) profileFields.githubusername = githubusername; 
    if(skills) {
      profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    //buils social object. 
    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
        let profile = await Profile.findOne({
          user: req.user.id
        })
        

        if(profile) {
          //it means the profile already exists so we're updating.. 
          profile = await Profile.findOneAndUpdate(
            { user: req.user.id }, 
            { $set: profileFields },
            { new: true }        
          );
          
          return res.json(profile); 
        }

        // create profile if not found.. 
        profile = new Profile(profileFields);
        await profile.save(); 
        res.json(profile);
    } catch(err){
      console.error(err.message); 
      res.status(500).send('server err');
    }

  }
);

/** @route get api/profile
 *  @desc get all profiles
 *  @access public 
 */

 router.get('/', async (req,res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);

    } catch (err) {
      console.error(err.message);
      res.status(500).send('server error');
    }
 })

 /** @route get api/profile/user/:user_id
 *  @desc get profile by user id
 *  @access public 
 */

router.get('/user/:user_id', async (req,res) => {
  try {
      const profile = await Profile.findOne({
        user: req.params.user_id
      }).populate('user', ['name', 'avatar']);

      if(!profile) return res.status(400).json({
        msg: 'profile not found'
      });
      res.json(profile);

  } catch (err) {
    console.error(err.message);
    if(err.kind == 'ObjectId'){
      return res.status(400).json({
        msg: 'profile not found'
      });
    }
    res.status(500).send('server error');
  }
})

 /** @route Delete api/profile
 *  @desc delete user and profile and posts
 *  @access private
 */
router.delete('/', auth, async (req,res) => {
  try {
      // @todo remove posts
      // remove profile (Profile Model)
      await Profile.findOneAndRemove({
        user: req.user.id
      })

      // remove User (User Model)
      await User.findOneAndRemove({
        _id: req.user.id
      })
      
      res.json({msg: 'user deleted'})

  } catch (err) {
    console.error(err.message);
    res.status(500).send('server error');
  }
})


/** @route Put api/profile/experience
 *  @desc add profile experience
 *  @access private
 */
router.put('/experience', [auth, [
  check('title', 'Title is req').not().isEmpty(),
  check('company', 'Company is req').not().isEmpty(),
  check('from', 'From date is req').not().isEmpty()
]], async (req,res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    res.status(400).json({
      errors: errors.array()
    });
  }

  const {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  } = req.body; 
  
  const newExp = {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  }
  
  try {
    const profile = await Profile.findOne({
      user: req.user.id // from token
    });

    profile.experience.unshift(newExp);

    await profile.save()

    res.json(profile);

  } catch (error) {
    console.error(error.message);
    res.status(500).send('server error')
  }


});


/** @route DELETE api/profile/experience/exp_id
 *  @desc delete profile experience
 *  @access private
 */

 router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
      const profile = await Profile.findOne({
        user: req.user.id // from token
      });

      //get remove index
      const removeIndex = profile.experience.map(
        item => item.id
      ).indexOf(req.params.exp_id);

      profile.experience.splice(removeIndex, 1);

      await profile.save();
      res.json(profile);




    } catch (error) {
      console.error(error.message);
      res.status(500).send('server error')
    }
 })

 /** @route Put api/profile/education
 *  @desc add profile education
 *  @access private
 */
router.put('/education', [auth, [
  check('school', 'School is req').not().isEmpty(),
  check('degree', 'Degree is req').not().isEmpty(),
  check('from', 'From date is req').not().isEmpty(),
  check('fieldofstudy', 'Field of Study is req').not().isEmpty()

]], async (req,res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    res.status(400).json({
      errors: errors.array()
    });
  }

  const {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  } = req.body; 
  
  const newEdu = {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  }
  
  try {
    const profile = await Profile.findOne({
      user: req.user.id // from token
    });

    profile.education.unshift(newEdu);

    await profile.save()

    res.json(profile);

  } catch (error) {
    console.error(error.message);
    res.status(500).send('server error')
  }


});


/** @route DELETE api/profile/education/edu_id
 *  @desc delete profile education
 *  @access private
 */
 router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
      const profile = await Profile.findOne({
        user: req.user.id // from token
      });

      //get remove index
      const removeIndex = profile.education.map(
        item => item.id
      ).indexOf(req.params.edu_id);

      profile.education.splice(removeIndex, 1);

      await profile.save();
      res.json(profile);

    } catch (error) {
      console.error(error.message);
      res.status(500).send('server error')
    }
 })


/** @route GET api/profile/github/:username
 *  @desc get user repos from github
 *  @access Public
 */

 router.get('/github/:username', (req,res) =>{
   try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientId'
      )}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' }
}; 

      request(options, (error, response, body) => {
        if(error) console.error(error);
        if(response.statusCode !== 200) {
          res.status(404).json({
            msg: 'no github profile found'
          }); 
        }

        res.json(JSON.parse(body));

      });

   } catch (error) {
    console.error(error.message);
    res.status(500).send('server error')
   }
 })

module.exports = router;
