const express = require('express');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3000;
const path = require('path');
const port = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'pug');
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
    age: { type: Number, min: 18, max: 70 },
    createdDate: { type: Date, default: Date.now }

});
const user = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
    res.render('main');
})

app.post('/create', (req, res) => {
    console.log(`POST /create: ${JSON.stringify(req.body)}`);
    const newUser = new user();
    newUser.firstName = req.body.firstName;
    newUser.lastName = req.body.lastName;
    newUser.email = req.body.email;
    newUser.save((err, data) => {
        if (err) {
            return console.error(err);
        }
        console.log(`new user save: ${data}`);
        res.send(`done ${data}`);
    });
})

//change to update many

// app.post('/edit', (req, res) => {
//     console.log(`POST /edit: ${JSON.stringify(req.body)}`);
//     let matchedName = req.body.firstName;
//     let newrole = req.body.role;
//     user.findOneAndUpdate({ name: matchedName }, { role: newrole },
//         { new: true }, //return the updated version instead of the pre-updated document 
//         (err, data) => {
//             if (err) return console.log(`Oops! ${err}`);
//             console.log(`data -- ${data.role}`)
//             let returnMsg = `username : ${matchedName} New role : ${data.role}`;
//             console.log(returnMsg);
//             res.send(returnMsg);
//         });
// })


app.listen(port, (err) => {
    if (err) console.log(err);
    console.log(`App Server listen on port: ${port}`);
});