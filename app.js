const express = require('express'),
port = process.env.PORT || 3000,
app = express(),
csrf = require('csurf'),
cookieParser = require('cookie-parser'),
bodyParser = require('body-parser'),
session = require('express-session'),
fs = require('fs'),
date = new Date(),
day = (`0 ${date.getDate()}`).slice(-2),
month = (`0 ${date.getMonth() + 1}`).slice(-2),
year = date.getFullYear(),
today = `${year}-${month}-${day}`
flName = `${today}.json`,
dirAccount = 'accounts/';

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(csrf({ cookie: true }));
app.use(session({secret: today, saveUninitialized: false, resave: false}));

fs.readdir(dirAccount, (err, files) => {
	if(err)
		return console.log(err);

	files.forEach((file) => {
		if(file != flName && file != '.gitignore') {
			fs.unlinkSync(dirAccount+file);
			console.log(`${file} deleted`);
		}
	});
});

/* index */
app.get('/', (req, res) => {
	if(req.session.loggedin)
		res.render('index.ejs', {
			title: `welcome ${req.session.user}`,
			name: req.session.name,
			mail: req.session.mail,
			admin: req.session.admin
		});
	else
		res.redirect('/register');
});

/* login */
app.get('/login', (req, res) => {
	if(req.session.loggedin)
		res.redirect('/');
	else
		res.render('login.ejs', {title: 'Login', token: req.csrfToken()});
});

app.post('/login', (req, res) => {
	let body = req.body;
	fs.readFile(dirAccount+flName, (err, data) => {
		if(err)
			data = [];
		else
			data = JSON.parse(data);

		let exist = data.filter(user => (user.user === body.user || user.mail === body.user && user.pass === body.pass));
		if(exist.length > 0) {
			exist = exist[0];
			req.session.loggedin = true,
			req.session.name = exist.name,
			req.session.user = exist.user,
			req.session.mail = exist.mail,
			req.session.admin = exist.admin;
			res.send(JSON.stringify({
				'resp': 'success',
				'msg': 'login success'
			}));
		} else {
			res.send(JSON.stringify({
				'resp': 'danger',
				'msg': 'login failed'
			}));
		}
	});
});

/* register */
app.get('/register', (req, res) => {
	if(req.session.loggedin)
		res.redirect('/');
	else
		res.render('register.ejs', {title: 'register', token: req.csrfToken()});
});

app.post('/register', (req, res) => {
	let body = req.body;
	body.admin = body.admin ? 1 : 0;
	fs.readFile(dirAccount+flName, (err, data) => {
		if(err)
			data = [];
		else
			data = JSON.parse(data);

		let exist = data.filter(user => (user.user === body.user || user.mail === body.mail));

		if(exist.length > 0) {
			exist = exist[0];
			const userExist = exist.user === body.user,
			mailExist = exist.mail === body.mail;
			let name;
			if(userExist && mailExist)
				name = 'username and usermail';
      else if(userExist || mailExist)
      	name = userExist ? 'username' : 'usermail';

			return res.send(JSON.stringify({
				'resp': 'warning',
				'msg': `${name} exist`
			}));
		}

		if(body.user.length > 15) {
			return res.send(JSON.stringify({
				'resp': 'warning',
				'msg': 'user length < 15'
			}));
		}

		if(body.name.length > 30) {
			return res.send(JSON.stringify({
				'resp': 'warning',
				'msg': 'user length < 30'
			}));
		}

		if(body.user.length == 0 || body.name.length == 0 || body.mail.length == 0 || body.pass.length == 0) {
			return res.send(JSON.stringify({
				'resp': 'danger',
				'msg': 'isi semua data yang diminta'
			}));
		}

		data.push(body);
		fs.writeFile(dirAccount+flName, JSON.stringify(data), (err) => {
			if(err) {
				res.send(JSON.stringify({
					'resp': 'danger',
					'msg': 'register failed'
				}));
				return console.log(err);
			}

			res.send(JSON.stringify({
				'resp': 'success',
				'msg': 'account registered'
			}));
		});
	});
});

app.get('/logout', (req, res) => {
	req.session.destroy();
	res.redirect('/login');
});

app.listen(port, () => {
	console.log(`started with port ${port}`);
});