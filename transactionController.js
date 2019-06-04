const { check, validationResult } = require("express-validator/check")

var transactions = [];
var merchantNames = new Map();

// Validators for Transaction schema

var validators = [
    check("user-id")
        .isInt().withMessage("Invalid user-id"),
    check("merchant")
        .isLength({ min:1 }).withMessage("Invalid merchant"),
	check("merchant-id")
		.isInt().withMessage("Invalid merchant-id format"),
	check("price")
        .isNumeric().withMessage("Invalid price"),
	check("purchase-date")
        .isISO8601().withMessage("Invalid purchase date"),
	check("tx-id")
        .isInt().withMessage("Invalid txid"),
]

// Takes in a POST request with information for a new transaction
// Returns 200 status and saves transaction data to the array on successful validation
// Returns 400 status on validation failure

exports.newTransaction = [
	validators,
	(req, res) => {  
		var errors = validationResult(req);
	 
		if (!errors.isEmpty()) {
			res.status(400).json(errors.array());
		} else if (merchantNames.has(req.body["merchant-id"]) && 
			merchantNames.get(req.body["merchant-id"]) != req.body["merchant"]){
				res.status(400).json("{Error - Merchant ID doesn't match merchant name}");
			}
		else {
			var newTransaction = {
				"user-id": req.body["user-id"],
				"merchant-id": req.body["merchant-id"],
				"price": req.body["price"],	
				"purchase-date": req.body["purchaseDate"],
				"tx-id": req.body["tx-id"]
			}
			merchantNames.set(req.body["merchant-id"], req.body["merchant"]);
			transactions.push(newTransaction);
			res.sendStatus(200);
		}
	
	}
];

// Takes in a GET request with a user id e.g. localhost:3000/id
// Searches for transactions with given user id
// Places them in a map with the merchant as the key and number of transactions for that user as the value
// Sorts this map by value into temporary map
// Returns the top 3 most visited merchants

// toDo: Maintain maps for users and merchants depending on API requirements

exports.mostVisitedByUser = function(req, res, next){
	var id = req.params.id;
	var limit = 3, threshold = 5;
	var m = new Map();
	for (var i = 0; i < transactions.length; i++) {
		if (transactions[i]["user-id"] == id){
			threshold--;
			if (m.has(transactions[i]["merchant-id"])){
				var total = m.get(transactions[i]["merchant-id"]) + 1;
				m.set(transactions[i]["merchant-id"], total);
			}
			else{
				m.set(transactions[i]["merchant-id"], 1);
			}
		}
	}
	const mSort = new Map([...m.entries()].sort((a, b) => b[1] - a[1]));
	if (mSort.size >= limit && threshold < 1){		
		var mSortI = mSort.keys();
		var result = "";
		console.log(mSortI);
		
		for (var i = 0; i < limit - 1; i++){
			result += merchantNames.get(mSortI.next().value) + ", ";
		}
		result += merchantNames.get(mSortI.next().value);
		console.log(result);
		res.json(result);
	}
	else {
		res.status(400).json("{Error - Too few transactions}");
	}
};
