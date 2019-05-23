var express = require('express');
var router = express.Router();

var transaction_controller = require('./transactionController');

router.post('/', transaction_controller.newTransaction);
router.get('/:id', transaction_controller.mostVisitedByUser);

module.exports = router;