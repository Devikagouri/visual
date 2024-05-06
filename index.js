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
const {ObjectId} = require('mongodb');
const { name } = require('ejs');

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
                const token = jwt.sign({id:document._id,username:document.username},"secret_key");
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

app.get('/goToChat',(req,res)=>{
    res.render('chat');
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
    console.log("Upload Body: ",req.body);

    var artID = req.body.artID;
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
            decoded_id = decoded.id;
            console.log("UP D uname: ",decoded_username);
            console.log("UP D ID: ",decoded_id)
        }
    })

    var username = decoded_username;

    var data = {
        "artID": artID,
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
            decoded_id = decoded.id
            decoded_username = decoded.username;
            console.log("D uname: ",decoded_username);
            console.log("D Id: ",decoded_id)
        }
    })

    db.collection("Artwork").find({username:decoded_username}).toArray().then(arr_img=>{
        console.log(arr_img);
        res.json(arr_img);
    }).catch(error=>{
        console.log(error);
    })
})


app.post('/profileDetails',(req,res)=>{
    console.log("Profile Token");
    var token = req.body.token;
    console.log(token);

    jwt.verify(token,"secret_key",(err,decoded)=>{
        if(err){
            console.log('Invalid token');
        }
        else{
            console.log('decoded profile token');
            decoded_username = decoded.username;
            decoded_id = decoded.id;
            console.log(decoded_username);
            console.log(decoded_id);
        }
    })

    const nid = new ObjectId(decoded_id)
    console.log("filer: ",nid)
    db.collection("User").findOne({_id:nid}, (err,document)=>{
        if(err){
            console.log(err)
        }
        else{
            console.log("Profile:",document);
            res.json(document);
        }
    })
})



app.post('/product',(req,res)=>{
    console.log("token");
    var artID = req.body.artID;
    var token = req.body.token;
    console.log(token);

    data ={
        "artID": artID
    }

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
    var user_fullname;
    db.collection("User").findOne({username:decoded_username},(err,doc)=>{
        if(err){
            console.log(err);
        }
        else{
            user_fullname = document.name;
        }
    })

    db.collection("Artwork").find({username:decoded_username, artID:data.artID}).toArray().then(arr_img=>{
        console.log(arr_img);
        arr = {
            image: arr_img,
            fname: user_fullname
        }
        res.json(arr);
    }).catch(error=>{
        console.log(error);
    })
})

var profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'profile')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname + '-' + Date.now())
    }
});

var profileUpload = multer({ storage: profileStorage });


app.post('/update',profileUpload.single('image'),(req,res)=>{
    console.log("Update body:",req.body);
    console.log("Update file:",req.file);
    var name = req.body.fullname;
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var phno = req.body.phno;
    var location = req.body.location;
    var bio = req.body.bio;

    var decoded_id;

    const token = req.body.token;
    jwt.verify(token,"secret_key",(err,decoded)=>{
        if(err){
            console.log('Invalid token');
        }
        else{
            console.log('decoded');
            decoded_username = decoded.username;
            decoded_id = decoded.id
            console.log(decoded_username);
            console.log(decoded_id)
            
        }
    })

    var data = {
        "image": {
            data:fs.readFileSync(path.join(__dirname+'/profile/'+req.file.filename)),
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
            nid = new ObjectId(decoded_id)
            if(document && document._id.toString() != nid.toString()){
               console.log(nid)
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
                console.log(JSON.stringify(returnObj))
                res.send(JSON.stringify(returnObj));

                
            }
            else{
                const nid = new ObjectId(decoded_id)
                console.log(nid)
                db.collection("User").findOneAndUpdate({_id:nid},{$set:{
                    "name": data.name,
                    "username": data.username,
                    "email": data.email,
                    "phno": data.phno,
                    "password":data.password,
                    "location": data.location,
                    "bio": data.bio,
                    "profileImg":data.image
                }},(err,collection)=>{
                    if(err){
                        throw err;
                    }
                    else{
                        db.collection("Artwork").updateMany({username:decoded_username},{$set: {username:data.username}})
                        const token = jwt.sign({id:decoded_id,username:data.username},"secret_key");
                        jwt.verify(token,"secret_key",(err,decoded)=>{
                            if(err){
                                console.log('Invalid token');
                            }
                        })
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

app.get('/goToProduct',(req,res)=>{
    res.render('product')
})

app.get('/goToQuotes',(req,res)=>{
    res.render('quotesPage')
})

app.get('/getImageDetails/:id',async (req,res)=>{
    const id = req.params.id;
    console.log(id)
    const nid = new ObjectId(id)
    console.log(nid)
    db.collection('Artwork').findOne({_id:nid}, async (err,document)=>{
        if(err){
            console.log(err)
        }
        else{
            console.log("Found: ",document)
            db.collection('User').findOne({username:document.username}, async (err,user)=>{
                if(err){
                    console.log(err)
                }
                else{
                    console.log(user)
                    var obj = {
                        "document_key": document,
                        "user_key" : user
                    }
                    console.log(obj)
                    res.json(obj)
                }
            })
        }
    })
})

app.get('/viewQuotes/:id',async (req,res)=>{
    const id = req.params.id;
    console.log(id)
    const nid = new ObjectId(id)
    console.log(nid)
    db.collection('Quote').find({artID:nid}).toArray().then(all_quotes => {
        res.json(all_quotes)
    }).catch(error=>{
        console.log(error)
    })
})

app.get('/homeImages',async (req,res)=>{
    db.collection("Artwork").find({}).toArray().then(all_arr_img=>{
        console.log(all_arr_img);
        res.json(all_arr_img);
    }).catch(error=>{
        console.log(error);
    })
})

app.post('/quote',(req,res)=>{
    const { title, image_id, token, price } = req.body;
    console.log("Title: ", title);
    console.log("Image ID: ", image_id);
    console.log("Token: ", token);
    console.log("Price: ", price);

    var decoded_id;
    jwt.verify(token,"secret_key",(err,decoded)=>{
        if(err){
            console.log('Invalid token');
        }
        else{
            console.log('decoded');
            decoded_username = decoded.username;
            decoded_id = decoded.id
            // console.log(decoded_username);
            // console.log(decoded_id)
            
        }
    })

    var image;

    const nid = new ObjectId(image_id)
    db.collection('Artwork').findOne({_id:nid}, async (err,document)=>{
        if(err){
            console.log(err)
        }
        else{
            console.log("Found: ",document)
            const uid = new ObjectId(decoded_id)
            db.collection('User').findOne({_id:uid}, async (err,user)=>{
                if(err){
                    console.log(err)
                }
                else{
                    console.log("User: ",user)
                    var obj = {
                        'artID':document._id,
                        'image':document.image,
                        'username':user.username,
                        'name':user.username,
                        'phno':user.phno,
                        'email':user.email,
                        'title':document.title,
                        'price':price
                    }
                    console.log(obj)
                    db.collection('Quote').insertOne(obj,(err,collection)=>{
                        if(err){
                            console.log(err)
                            key = "Failed to Quote"
                            res.json({key})
                        }
                        else{
                            console.log("Quoted Successfully")
                            key = "Quoted Successfully"
                            res.json({key})
                        }
                    })
                }
            })
        }
    })

})



app.get('/goToAddImage',(req,res)=>{
    res.render('upload_image');
});



app.listen(2000);