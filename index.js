const express = require('express');
const exphbs  = require('express-handlebars');

const app = express();
const PORT =  process.env.PORT || 3019;

// enable the req.body object - to allow us to use HTML forms
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//enable Pool
const pg = require("pg");
const Pool = pg.Pool;

const connectionString = process.env.DATABASE_URL || 'postgresql://codex:pg123@localhost:5432/avo_shopper'
const pool = new Pool({
	connectionString,
	ssl: {
	  rejectUnauthorized: false,
	},
  });
const avo = require("./avo-shopper");
const AvoShop = avo(pool);

// enable the static folder...
app.use(express.static('public'));

// add more middleware to allow for templating support

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

let avoDeals;

app.get('/',async function(req, res) {
 avoDeals = await  AvoShop.topFiveDeals();
	res.render('index', {
		avoDeals
	});
});

app.get('/add', function(req, res) {

	res.render('addDeals');
});

app.get('/shopList',async function(req, res) {
let list = await AvoShop.listShops()
	res.render('shopList',{
		list
	});
});

// app.post('/shopList/:id',async function(req, res) {
// 	let id = req.body.id
// 		res.redirect(`/shopList/${id}`);
// 	});


app.post('/add',async function(req, res) {

const id = req.body.shopID;
const qty = req.body.quantity;
const prices = req.body.price;
await AvoShop.createDeal(id,qty,prices);

	res.redirect('/add');
});
app.post('/budget',async function(req, res) {

	avoDeals =await AvoShop.recommendDeals(req.body.budget)
	
		res.render('index',{
			avoDeals
		});
	});

	app.get('/shopList/:id',async function(req, res) {
		let id = req.params.id
		
		 const specials= await AvoShop.dealsForShop(id)
		// console.log(req.body);
	
		res.render('selected',{
			specials
		});
	});
	app.get('/new',async function(req, res) {
	
		res.render('newStore');
	});

	app.post('/new',async function(req, res) {
	
		await AvoShop.createShop(req.body.store)
			res.redirect('/new');
		});

	

	
// start  the server and start listening for HTTP request on the PORT number specified...
app.listen(PORT, function() {
	console.log(`AvoApp started on port ${PORT}`)
});