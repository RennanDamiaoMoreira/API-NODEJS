const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require ('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');


const authConfig = require('../../config/auth');

const User = require('../models/User');

const router = express.Router();

function generateToken(params={}){
  return  jwt.sign(params, authConfig.secret,{
    expiresIn:86400,
});  
}

router.post('/register', async (req, res) => {
  const { email } = req.body;
  try {
      if (await User.findOne({ email })) {
          return res.status(400).send({ error: 'User  alrealy exsists' });
      }
      const user = await User.create(req.body);

      user.password = undefined;
      const token = generateToken({id:user.id});

      res.send({user,token});
  } catch (err) {
      return res.status(400).send({ error: 'Registration falied' });
  }
});

router.post('/autenticate',async(req,res)=>{
    const {email,password}=req.body;

    const user = await User.findOne({email}).select('+password');

    if (!user){
        return res.status(400).send({error:'user not found'});
    }

    if (!await bcrypt.compare(password, user.password)){
        return res.status(400).send({error:'password incorret , login is failed '});
    }    
    user.password=undefined;
    const token = generateToken({id:user.id});

    res.send({user,token});

});

router.post('/forgot_password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send({ error: 'User not found' });
        }
        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        });

        await mailer.sendMail({
            to: email,
            from: 'sistemaderacuperacaodesenha@nanner.com',
            subject: 'Envio de e-mail usando Node.js.',
            template: 'forgotPassword',
            context: { token },

        },(err) => {
            if (err) {
                console.log(err);
                return res.status(400).send({ error: 'Cannot send forgot password email' });
            }
            return res.send();
        })

    } catch (err) {
        console.log(err);
        res.status(400).send({ error: 'Error on forgot password, try again' });
    }
});
router.post('/reset_password',async(req,res)=>{
const {email,token,password}=req.body;
try{
    const user = await User.findOne({email}).select('+passwordResetToken passwordResetExpires');

    if (!user){
        return res.status(400).send({error:'user not found'});
    }
    if (token!=user.passwordResetToken){
        return res.status(400).send({error:'Error tonken is invalid, please try again'});
    }
    const now = new Date();
  
    if (now>user.passwordResetExpires){
        return res.status(400).send({error:'your token has expired'})
    }
    user.password = password;
    await user.save();

    res.send();
}catch{
    return res.status(400).send({error:'cannot reset password, try again'});
}
});
module.exports = (app) => app.use('/auth', router);
