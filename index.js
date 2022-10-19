const express= require('express')
const bp= require('body-parser')
const { body, validationResult } = require('express-validator');
const pug = require('pug');
const path= require('path')
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema= require('./Schema')
const JWT_STRING= "JWT@Dsandhu#Gomato"
const jwt = require('jsonwebtoken');
const items = mongoose.model('item', Schema);  // mongoose.model('Name of COllection',Schema)

let users=[]
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/gomato');// Here zomato is Name of Database
  
}
const userSchema = new mongoose.Schema({
    username:String,
    mobile:String,
    email:String,
    password:String
  });
const cartSchema = new mongoose.Schema({
    user:String,
    order:String,
  });
  let Cart= mongoose.model('cart',cartSchema)
  const User = mongoose.model('users',userSchema);



const app= express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
// app.engine('handlebars', handlebars.engine());
app.use(express.static(path.join(__dirname,'/static')))
app.set('view engine', 'pug');
app.set('views', './views');
let category=[]

app.get('/',(req,res)=>{
    res.render('home.pug')
})
{{{}}}
app.get('/order',async (req,res)=>{
    let foodCategory=[]
    let orders=await items.find()
    orders.forEach((e)=>{
        foodCategory.push(e.category)
    })

    let uniqueItems= foodCategory.filter((item,
            index) => foodCategory.indexOf(item) === index)
            
            res.render('order.pug',{uniqueItems})
})
app.get('/order/items',(req,res)=>{
    res.render('home.pug')
})
app.post('/order/items',async(req,res)=>{
    let foodItems= await items.find({category:req.body.item})
    res.render('items',{foodItems})
})
app.get('/order/items/finalOrder',(req,res)=>{
    res.send('/')
})
app.post('/order/items/finalOrder',async (req,res)=>{
    let item= await items.find({_id:req.body._id})

    res.render('finalOrder.pug',{item})
})
app.post('/order/items/finalOrder/payment',async (req,res)=>{
    let item= await items.find({_id:req.body._id})
    res.send(item)
})

app.get('/cart',async(req,res)=>{

})
app.post('/cart',async(req,res)=>{
    if(req.app.get('token')){
        let order=await Cart.create({user:req.app.get('token'),order:req.body.order})
        console.log(order)
        let orders=await Cart.find({user:req.app.get('token')})
        // console.log(orders)
        let person= req.app.get('token')
        alert= "Order Added"
        res.render('cart.pug',{alert,orders,person})
    }
    else{
        res.redirect('/login')
    }

})
app.post('/search',async (req,res)=>{
    let searchedArray=[]
    let item= await items.find()
    let search=req.body.search
    item.forEach(e=>{
        if(e.item.toLowerCase()===req.body.search.toLowerCase()){
            searchedArray.push(e)
        }
        else if(e.from.toLowerCase()===req.body.search.toLowerCase()){
            searchedArray.push(e)
        }
        else if(e.category.toLowerCase()===req.body.search.toLowerCase()){
            searchedArray.push(e)
         }
         
        })
        res.status(200).render('search.pug',{searchedArray,search})
    })


app.get('/signup',(req,res)=>{
    // res.send("Kindly Enter Your Mobile Number")
    if(req.app.get('token')){
        
        res.redirect('/user')
    }
    res.render('signup.pug')

})
app.post('/signup',[
    body('email',"Email Must be a Email").isEmail(),
    body('username',"Username must contain atleast 5 character.").isLength({ min: 5 }),
    body('mobile',"Invalid Mobile Number").isLength({ min: 10,max: 10 }),
    body('password',"Password must contain atleast 5 character.").isLength({ min: 5 }),
],async(req,res)=>{
    
    if(req.app.get('token')){
        
        res.redirect('/user')
    }
    else{
        const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let torf= await User.find({$or : [{"username" : req.body.username},{"mobile" : req.body.mobile},{"email":req.body.email}]})
    if(torf.length===0){
        User.create({
            username:req.body.username,
            email:req.body.email,
            mobile:req.body.mobile,
            password:await bcrypt.hash(req.body.password,await bcrypt.genSalt(10)),
        })
        alert= "User Created Kindly Login"
        res.render('signup.pug',{alert})
    }
    else{
        alert= "User Already Exists"
        res.render('signup.pug',{alert})
    }
    }
})

app.post('/addcart',(req,res)=>{
    
})
app.get('/login',(req,res)=>{
    if(req.app.get('token')){
        
        res.redirect('/user')
    }
    res.render('login.pug')
})
app.post('/login',async(req,res)=>{

    let torf= await User.find({username:req.body.username})
    if(torf.length!=0){
       let user= await bcrypt.compare(req.body.password,torf[0].password)
        if(user===true){
            let data= {
                user:torf[0].username
            }
            let token= jwt.sign(data,JWT_STRING)
            // res.send(token)
            // res.redirect('/')
            req.app.set('token',token)
            res.redirect('/user')
            
        }
        else{
            alert= "Invalid Credintials"
            // res.render('login.pug',{alert})
            // res.render('login.pug',alert)
            res.render('login.pug',{alert})

        }
    }
    else{
        alert= "Invalid Credintials"
        res.render('login.pug',{alert})
        
    }
})

app.get('/user',async(req,res)=>{
    if(req.app.get('token')){
        try {
            let string=jwt.verify(req.app.get('token'),JWT_STRING)
        let person=await User.find({username:string.user}).select('-password').select('-_id')
        res.render('cart.pug',{person})
        } catch (error) {
            res.render('login.pug',{error})
        }
    }
    else{
        res.redirect('/login')
    }
})
app.listen(80,()=>{
    console.log("http://localhost")
})