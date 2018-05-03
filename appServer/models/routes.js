const express = require('express');
const router = express.Router();

const data = require('../../config');
const page = require('../controlers/page');
const user = require('../controlers/user');
const profil = require('../controlers/profil');
const upload = require('../controlers/upload');

router.get('/', (req,res)=>{page.pageReadOne(req,res,"index")});
router.get('/home/', (req,res)=>{page.pageReadOne(req,res,"index")});
router.get('/home/:lan/', (req,res)=>{page.pageReadOne(req,res,"index")});
router.get('/signup/', (req,res)=>{page.pageReadOne(req,res,"signup")});
router.get('/signup/:lan', (req,res)=>{page.pageReadOne(req,res,"signup")});
router.get('/signin/', (req,res)=>{page.pageReadOne(req,res,"signin")});
router.get('/signin/:lan', (req,res)=>{page.pageReadOne(req,res,"signin")});

router.get('/users/', (req,res)=>{user.pageReadUsers(req,res,"users")});
router.get('/user/:id', (req,res)=>{user.pageReadUser(req,res,"user")});
router.get('/profil/:id', (req,res)=>{user.pageReadProfil(req,res,"profil")});
router.get(`${data.email.link2}:email/:id`, (req,res)=>{user.userCreate(req,res)});
router.get(`${data.email.link3}:email/:psw`, (req,res)=>{user.userResetPas(req,res)});
router.get(`${data.email.link4}:oldmail/:email`, (req,res)=>{profil.emailChangeConfirm(req,res)});

router.post('/confirm', (req,res)=>{ user.userConfirm(req,res,"confirm") });
router.post('/forgot', (req,res)=>{ user.userForgot(req,res) });
router.post('/signin', (req,res)=>{ user.userLogin(req,res) });
router.post('/logout', (req,res)=>{ user.userLogout(req,res) });

router.post('/nameChange', (req,res)=>profil.nameChange(req,res));
router.post('/emailChange', (req,res)=>profil.emailChange(req,res));
router.post('/pswChange', (req,res)=>profil.pswChange(req,res));
router.post('/uploadFile', (req,res)=>upload.uploadFile(req,res));
module.exports = router