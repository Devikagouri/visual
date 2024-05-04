const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/visualvogue');

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const Artwork = require('./models/art');
const bodyParser = require('body-parser');

const app = express();

var db = mongoose.connection;

app.set('view engine','ejs');
app.use(express.json());
app.use(express.static('views'));
app.use(bodyParser.urlencoded({
    extended: true
}))

app.get('/',(req,res)=>{
    res.render('acc_creation');
})

app.post('/register',(req,res)=>{
    var name = req.body.fullname;
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var phno = req.body.phno;
    var location = req.body.location;
    var bio = req.body.bio;

    var data = {
        "name" : name,
        "username": username,
        "email": email,
        "password": password,
        "phno": phno,
        "location": location,
        "bio": bio
    }
    db.collection('User').findOne({username:data.username},{email:data.email},{phno:data.phno},(err,document)=>{
        if(err){
            console.log(err);
            throw err;
        }
        else
        {
            if(document){
                var uname,mail,ph;
                console.log('found document: ',document);
                if(document.username==data.username){
                    uname = 'Username already exists';
                }
                else{
                    uname = "";
                }
                if(document.email==data.email){
                    mail = 'Email already registered';
                }
                else{
                    mail = "";
                }
                if(document.phno==data.phno){
                    ph = 'Phone number already registered';
                }
                else{
                    ph = "";
                }

                returnObj = {uname,mail,ph};
                res.send(JSON.stringify(returnObj));
                
            }
            else{
                db.collection("User").insertOne(data,(err,collection)=>{
                    if(err){
                        throw err;
                    }
                    else{
                        res.redirect('/goToLogin');
                    }
                })
            }
        }
    });

    
    
});

app.get('/goToLogin',(req,res)=>{
    res.render('login');
});


app.post('/login',(req,res)=>{
    var username = req.body.username;
    var password = req.body.password;

    var data = {
        "username" : username,
        "password" : password
    };

    db.collection('User').findOne({username:data.username,password:data.password},(err,document)=>{
        if(err){
            console.log(err);
            throw err;
        }
        else
        {
            var key;
            if(document){
                //redirect to home
                const token = jwt.sign({username:document.username},"secret_key");
                res.json({token});
            }
            else{
                //Print invalid
                key = 'Invalid username or password';  
                res.status(401).json({key});    
            }
            
        }
    })

})

app.get('/goToHome',(req,res)=>{
    res.render('home');
});

app.get('/goToRegistration',(req,res)=>{
    res.render('acc_creation');
})

app.get('/goToProfile',(req,res)=>{
    res.render('profile');
});

app.get('/goToUpdate',(req,res)=>{
    res.render('update');
});

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname + '-' + Date.now())
    }
});

var upload = multer({ storage: storage });


app.post('/upload',upload.single('image'),(req,res)=>{
    console.log(req.body);

    var title = req.body.title;
    var description = req.body.description;
    var theme = req.body.theme;
    var price = req.body.price;
    var height = req.body.height;
    var width = req.body.width;

    var token = req.body.token;

    jwt.verify(token,"secret_key",(err,decoded)=>{
        if(err){
            console.log('Invalid token');
        }
        else{
            console.log('decoded');
            decoded_username = decoded.username;
            console.log(decoded_username);
        }
    })

    var username = decoded_username;

    var data = {
        "title": title,
        "description": description,
        "theme": theme,
        "price": price,
        "height": height,
        "width": width,
        "username": username,
        "image": {
            data:fs.readFileSync(path.join(__dirname+'/uploads/'+req.file.filename)),
            contentType: 'image/png'
        }
    }

    db.collection("Artwork").insertOne(data,(err,collection)=>{
        if(err){
            throw err;
        }
        else{
            var key = "Upload Successfull"
            res.status(200).json({key});
        }
    })


})

app.post('/profile',(req,res)=>{
    console.log("token");
    var token = req.body.token;
    console.log(token);

    jwt.verify(token,"secret_key",(err,decoded)=>{
        if(err){
            console.log('Invalid token');
        }
        else{
            console.log('decoded');
            decoded_username = decoded.username;
            console.log(decoded_username);
        }
    })

    db.collection("Artwork").find({username:decoded_username}).toArray().then(arr_img=>{
        console.log(arr_img);
        res.json(arr_img);
    }).catch(error=>{
        console.log(error);
    })
})








app.post('/update',upload.single('image'),(req,res)=>{
    console.log("body:",req.body);
    var name = req.body.fullname;
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var phno = req.body.phno;
    var location = req.body.location;
    var bio = req.body.bio;

    const token = req.body.token;
    jwt.verify(token,"secret_key",(err,decoded)=>{
        if(err){
            console.log('Invalid token');
        }
        else{
            console.log('decoded');
            decoded_username = decoded.username;
            console.log(decoded_username);
            const token = jwt.sign({username:username},"secret_key");
            jwt.verify(token,"secret_key",(err,decoded)=>{
                if(err){
                    console.log('Invalid token');
                }
            })
        }
    })

    var data = {
        "image": {
            data:fs.readFileSync(path.join(__dirname+'/uploads/'+req.body.image)),
            contentType: 'image/png'
        },
        "name" : name,
        "username": username,
        "email": email,
        "password": password,
        "phno": phno,
        "location": location,
        "bio": bio,
        "token": token
    }
    
    db.collection('User').findOne({username:data.username},{email:data.email},{phno:data.phno},(err,document)=>{
        if(err){
            console.log(err);
            throw err;
        }
        else
        {
            var uname,mail,ph;
            if(document){
               
                console.log('found document: ',document);
                if(document.username==data.username){
                    uname = 'Username already exists';
                }
                else{
                    uname = "";
                }
                if(document.email==data.email){
                    mail = 'Email already registered';
                }
                else{
                    mail = "";
                }
                if(document.phno==data.phno){
                    ph = 'Phone number already registered';
                }
                else{
                    ph = "";
                }

                returnObj = {uname,mail,ph};
                res.send(JSON.stringify(returnObj));

                
            }
            else{
                db.collection("User").findOneAndUpdate({username:decoded_username},{$set:{
                    "name": data.name,
                    "username": data.username,
                    "email": data.email,
                    "phno": data.phno,
                    "password":data.password,
                    "location": data.location,
                    "bio": data.bio
                }},(err,collection)=>{
                    if(err){
                        throw err;
                    }
                    else{
                        var success = "Successfully Updated";
                        var uname='',mail='',ph='';
                        obj = {uname,mail,ph,success};
                        res.send(JSON.stringify(obj));
                    }
                })
            }
        }
    });

    
    
});





app.get('/goToAddImage',(req,res)=>{
    res.render('upload_image');
});



app.listen(2000);