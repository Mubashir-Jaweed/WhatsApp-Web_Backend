const mongoose = require("mongoose");
const Mess = mongoose.model("Message");
const router = require("express").Router();
const { Protect } = require("../middleware/AuthMiddleware");

router.post("/sendmessage", Protect, async (req, res) => {
  try {
    const date = new Date()
    const time = date.getHours()-12 + ":" + date.getMinutes()
    const { to, from, message } = req.body;
    if (!to || !from || !message) {
      return res.status(400).json("User Not Found");
    }
    const mess = await new Mess({
      to,
      from,
      message,
      time
    }).save();
    return res.status(200).json(mess);
  } catch (err) {
    return res.status(404).json(`errrrrrr err err err${err}`)
  }
});


router.get("/allmessage", Protect, async (req, res) => {
  try {
    const messages = await Mess.find({
      $or: [{ to: req.user.id }, { from: req.user.id }],
    });
    return res.status(200).json(messages);
  } catch (err) {
    return res.status(404).json(`Error fetching messages: ${err}`);
  }
});


router.delete('/deletemessage/:id',Protect,async (req,res)=>{
  try {
    const id = req.params.id 
    const user  =req.user.id
    const mess = await Mess.findById(id)
    if(mess.from == user){
     const deldeteMess = await Mess.findByIdAndDelete(id)
    return res.status(200).json("message Delete");
    }
    return res.status(200).json("You are not able to delete this message")
  } catch (err) {
        return res.status(404).json(`Error in messages: ${err}`);

  }
})
module.exports = router;
