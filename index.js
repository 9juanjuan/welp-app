const express = require('express'); // Bring in the express library.
const app = express();              // Create a new express app.
const es6Renderer= require('express-es6-template-engine');
// Require my session and session storage
//This module lets express track users as they go from page to page.
const session = require('express-session');

//Import the session storage module, and wire it up to the session module
const FileStore = require('session-file-store')(session);

// tell express to use the session modules
app.use(session({
    store: new FileStore(),// No options for now.
    secret: 'sjd9j9js9djsijdinsjnajfjj'
}));





// const http = require('http');
const querystring = require('querystring');
// const hostname = '127.0.0.1';

const port = 3000;
const Restaurant = require('./models/restaurants');
const User = require('./models/user');

app.engine('html', es6Renderer); // introduce express to es6renderer, speaks html
app.set('views', 'views');
app.set('view engine', 'html')// tell express to use as its view engine the thing that speaks html
// Second argument is the directory name

//Configure express to use the built in middleware 
// that can deal with form data.
app.use(express.urlencoded({extended:true}));


// Import my model class
app.get('/login', async (req , res) => {
    // res.send('this is the login form');
    res.render('login-form', {
        locals: {
            email: '',
            message: ''
        }
    });
});

app.post('/login', async (req , res) => {
    console.log(req.body)
    console.log(req.body.email)
    console.log(req.body.password)
    // res.send('yolo')
    const theUser = await User.getByEmail(req.body.email);
    console.log(theUser)
    theUser.setPassword("SpotsSpotsSpots")
    await theUser.save();
    if (theUser.checkPassword(req.body.password)) {
        //Save the users id to the session
        req.session.user = theUser.id;
        // Make sure the session is saved before we redirect
        req.session.save(() => {
            res.redirect('/dashboard')
        })
       console.log( 'did the if thing')
    } else {
        console.log('did the else thing')
        res.render('login-form', {
            locals: {
                email: req.body.email,
                message: 'Password incorrect. Please try again'
            }
        })
        // send the form back, but with the email already filled out. 
    }

});
app.get('/restaurants', async (req, res) => {
    const allRestaurants = await Restaurant.getAll();    
    // const restaurantJSON = JSON.stringify(allRestaurants);    
    // res.json will do 2 things:
    // 1. it converts your JavaScript Object or Array to a JSON string
    // 2. it puts the correct Content-Type header on the response
    res.json(allRestaurants);
});

app.get('/dashboard', async (req, res) => {
    console.log(`The users id is ${req.session.user}`);
    res.send('Welcome to your welp dashboard');
});


app.get('/users', async (req, res) => {
    const allUsers = await User.getAll();
    res.json(allUsers);
});


app.get('/users/:id', async (req, res) => {
    // How to grab a piece out of req.params (or any object):
    // const id = req.params.id;
    // This is known as "destructuring"
    const {id} = req.params;
    const theUser = await User.getById(id);
    res.json(theUser);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});