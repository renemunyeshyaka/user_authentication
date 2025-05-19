if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

//Importing installed npm libraries

const express = require("express")
const app = express()
const bcrypt = require ("bcrypt") //importing bcrypt package
const passport = require("passport")
const initializePassport = require("./passport-config")
const flash = require("express-flash")
const session = require("express-session")
const { name } = require("ejs")
const methodOveride = require ("method-override")

initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)


//store data in array
const users = [] //get data from user

app.use(express.static(__dirname + '/public'));
app.use(express.static('public'));
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, // we wont resave the session variable if nothing is changed
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOveride("_method"))

//Configuring the login functionality
app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
}))



//Configuring the register post functionality
app.post("/register", checkNotAuthenticated, async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 12)
        users.push({
            id: Date.now().toString(), 
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: hashedPassword,
            repassword: hashedPassword,
        })
        res.redirect("/login")
    } catch (e) {
        console.log(e);
        res.redirect("/register")
    }
    console.log(users); //console to display newly created users
})



//Routes
app.get('/dashboard', checkAuthenticated, (req, res) => {
    res.render("dashboard.ejs",  {name: req.user.name})
})
app.get('/', (req, res) => { // all users must be allowed to view index|home page. Currently no check is needed.
    res.render("index.ejs")
})
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render("login.ejs")
})

app.get('/forget', checkAuthenticated, (req, res) => {
    res.render("forget.ejs")
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render("register.ejs")
})

app.get('/payment', checkAuthenticated, (req, res) => {
    res.render("payment.ejs")
})
app.get('/std-registration', checkAuthenticated, (req, res) => {
    res.render("std-registration.ejs")
})

//End Routes

app.delete("/logout", (req,res) =>{
    req.logout(req.user, err =>{
        if (err) return next(err)
    })
    res.redirect("/")
})

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}
function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect("/dashboard")
    }
    next()
}


app.listen(3000)