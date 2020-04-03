const express = require('express');
const bcrypt = require('bcrypt');
const {nanoid} = require('nanoid');

const User = require('../models/User');

const router = express.Router();

router.post('/', async (req,res) => {
    const user = new User(req.body);

    try{
        await user.save();
        return res.send(user);
    }catch(error){
        return res.status(400).send(error)
    }
});

router.post('/sessions',async (req,res) => {
    console.log(req.body)
    const user = await User.findOne({username:req.body.username});


    if(!user){
        return res.status(400).send({error:'nOT FOUND'})
    }
    const isMatch = await bcrypt.compare(req.body.password,user.password);

    if(!isMatch){
        return res.status(400).send({error:'Password'})
    }
    user.token = nanoid(15);
   await User.updateOne({username:user.username},{$set:{token:user.token}});
    return res.send(user)

});
module.exports = router;