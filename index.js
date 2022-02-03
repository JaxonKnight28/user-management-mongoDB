const express = require('express');
let cons = require('consolidate');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3000;
const path = require('path');
const { json } = require('express/lib/response');
const port = process.env.PORT || 3000;

const app = express();

app.engine('html', cons.swig)
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'pages'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = 'mongodb://localhost/userManagement'; //database name
mongoose.connect(db);
const udb = mongoose.connection;
udb.on('error', console.error.bind(console, 'connection error:'));
udb.once('open', function () {
    console.log('db connected');
});

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    age: Number,
    createdDate: { type: Date, default: Date.now }

});
const user = mongoose.model('user', userSchema);

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/search', (req, res) => {
    res.render('search')
})

//create user
app.post('/create', (req, res) => {
    console.log(`POST /create: ${JSON.stringify(req.body)}`);
    const newUser = new user();
    newUser.firstName = req.body.firstName;
    newUser.lastName = req.body.lastName;
    newUser.email = req.body.email;
    newUser.age = req.body.age;
    newUser.save((err, data) => {
        if (err) {
            return console.error(err);
        }
        let returnMsg = `
            <h1>User Successfully Created User</h1>
            <p>First name: ${newUser.firstName}</p>
            <p>Last name: ${newUser.lastName}</p>
            <p>Email: ${newUser.email}</p>
            <p>Age: ${newUser.age}</p>
            <a href="/">Back</a>
            `;
        res.send(returnMsg);
    });
})


//User edit
app.post('/edit', (req, res) => {
    console.log(`POST /edit: ${JSON.stringify(req.body)}`);
    let userToChange = req.body.firstName;
    let lastName = req.body.lastName;
    let email = req.body.email;
    let age = req.body.age;
    user.findOneAndUpdate({ firstName: userToChange }, { lastName: lastName, email: email, age: age },
        { new: true },
        (err, data) => {
            if (err) return console.log(`Oops! ${err}`);
            let returnMsg = `
            <h1>User Successfully Edited</h1>
            <p>First name: ${userToChange}</p>
            <p>Last name: ${lastName}</p>
            <p>Email: ${email}</p>
            <p>Age: ${age}</p>
            <a href="/">Back</a>
            `;
            res.send(returnMsg);
        });
})

//delete user
app.post('/delete', (req, res) => {
    console.log(`POST /delete: ${JSON.stringify(req.body)}`);
    let firstToGo = req.body.firstName;
    let lastToGo = req.body.lastName
    user.deleteOne({ firstName: firstToGo, lastName: lastToGo },
        (err, data) => {
            if (err) return console.log(`Oops! ${err}`);
            let returnMsg = `
            <h1>User Successfully Deleted</h1>
            <p>${firstToGo} ${lastToGo} has been deleted</p>
            `;
            if (data.deletedCount == 0) {
                returnMsg = `<h1>Error</h1><p>${firstToGo} ${lastToGo} does not exists in the database</p>`
            }
            returnMsg += '<a href="/">Back</a>'
            res.send(returnMsg);
        });
})

//show users
app.get('/users:direction', (req, res) => {
    //console.log(req.params.direction);
    let returnMsg = '<h1>Users:</h1>'
    user.find({}, (err, users) => {
        //console.log(users);
        users.map((item) => {
            returnMsg += `
            <p>First Name: ${item.firstName}</p>
            <p>Last Name: ${item.lastName}</p>
            <p>Email: ${item.email}</p>
            <p>Age: ${item.age}</p>
            <p>----------------</p>
            `
        })
        returnMsg += '<a href="/">Back</a>'
        res.send(returnMsg)
    }).sort({ 'firstName': req.params.direction })


})

//search box
app.post('/search', (req, res) => {
    let query = req.body.query;
    user.find({ $or: [{ firstName: query }, { lastName: query }] }, (err, users) => { //{ firstName: query }
        let returnMsg = '<h1>Results:</h1>'
        if (users == false) {
            returnMsg += 'No Results <br><br>'
        }
        users.map((item) => {
            returnMsg += `
            <p>First Name: ${item.firstName}</p>
            <p>Last Name: ${item.lastName}</p>
            <p>Email: ${item.email}</p>
            <p>Age: ${item.age}</p>
            <p>----------------</p>
            `
        })
        returnMsg += '<a href="/search">Back</a>'
        res.send(returnMsg)
    })
})

app.listen(port, (err) => {
    if (err) console.log(err);
    console.log(`App Server listen on port: ${port}`);
});