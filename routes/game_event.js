// In /admin/routes/game_event.js
const express = require('express');
const router = express.Router();


router.get('/',(req, res)=>{
    res.render('game_event/data-game-event', {title: "Data Game Event", subTitle:"Data Game Event"})
});




module.exports = router;
