const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    about: { type: String, default: "Hey There! I am using WhatsApp" },
    pic: {
      type: String,
      default:
        "https://tse1.mm.bing.net/th?id=OIP.ZZQB0sMTxOboZUVx0CZgUwHaHa&pid=Api&rs=1&c=1&qlt=95&w=108&h=108",
    },
    password: String,
    contacts: Array,
    notification:Array,
  },
  {
    timeStamps: true,
  }
);



mongoose.model('User',userSchema)