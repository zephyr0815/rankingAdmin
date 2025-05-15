const express = require('express');
const router = express.Router();


router.get('/',(req, res)=>{
    res.render('recharge-exchange/recharge-exchange', {title: "Recharge Exchange", subTitle:"Recharge Exchange"})
});

module.exports = router;
