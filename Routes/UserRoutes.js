const mongoose = require("mongoose");
const router = require("express").Router();
const User = mongoose.model("User");
const Mess = mongoose.model("Message");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Protect } = require("../middleware/AuthMiddleware");

const generateToken = (id) => {
  return jwt.sign({ id }, "HelloWorld");
};

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ err: "Please Enter All Fields!" });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res
        .status(400)
        .json({ err: "User Already Exist with Email & Password" });
    }
    const hashPassword = await bcrypt.hashSync(password, bcrypt.genSaltSync(5));

    await new User({
      name,
      email,
      password: hashPassword,
    }).save();

    return res.status(200).json({ mes: "SignUp Successfully" });
  } catch (err) {
    return res.status(400).json({ err: `err err err err err ${err}` });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ err: "Please Enter All Fields!" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ err: "Wrong Email & Password" });
    }

    const decodePassword = await bcrypt.compare(password, user.password);

    if (decodePassword) {
      return res.status(200).json({
        id: user.id,
        token: generateToken(user.id),
      });
    }
    return res.status(400).json({ err: "Failed To Login" });
  } catch (err) {
    return res.status(400).json({ err: `err err err err err ${err}` });
  }
});

router.get("/alluser", Protect, async (req, res) => {
  try {
    const currentUser = req.user.id;
    const users = await User.find({})
      .select("-password")
      .select("-contacts")
      .select("notification");
    return res.status(200).json(users.filter((u) => u.id !== currentUser));
  } catch (err) {
    return res.status(400).json({ err: `err err err err err ${err}` });
  }
});

router.get("/singleuser/:id", Protect, async (req, res) => {
  try {
    const id = req.params.id;
    if (id) {
      const singleUser = await User.findById(id)
        .select("-password")
        .select("-contacts")
        .select("notification");
      return res.status(200).json(singleUser);
    }
    return res.status(400).json("Id not found");
  } catch (err) {
    return res.status(400).json({ err: `err err err err err ${err}` });
  }
});

router.put("/editname/:id", Protect, async (req, res) => {
  try {
    const id = req.params.id;
    const name = req.body.name;
    if (!id || !name) {
      return res.status(400).json("Not found");
    }
    const user = await User.findByIdAndUpdate(id, { name });
    if (!user) {
      return res.status(400).json("Errrrr");
    }
    return res.status(200).json("Name Update");
  } catch (err) {
    return res.status(400).json({ err: `err err err err err ${err}` });
  }
});
router.put("/editabout/:id", Protect, async (req, res) => {
  try {
    const id = req.params.id;
    const about = req.body.about;
    if (!id || !about) {
      return res.status(400).json("Not found");
    }
    const user = await User.findByIdAndUpdate(id, { about });
    if (!user) {
      return res.status(400).json("Errrrr");
    }
    return res.status(200).json("Updated");
  } catch (err) {
    return res.status(400).json({ err: `err err err err err ${err}` });
  }
});

router.put("/addnotification", Protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { notification } = req.body;
    if (!notification || !userId) return res.status(400).json("not Found");

    const notificationUpdate = await User.findByIdAndUpdate(userId, {
      notification,
    }).select("notification");

    return res.status(200).json(notificationUpdate);
  } catch (err) {
    return res.status(400).json({ err: `err err err err err ${err}` });
  }
});

router.get("/allnotification", Protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await User.findById(userId).select("notification");
    return res.status(200).json(notifications);
  } catch (err) {
    return res.status(400).json({ err: `err err err err err ${err}` });
  }
});

router.delete("/deletenotification", Protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const userNotif = await User.findById(userId).select("notification");
    const selectedUserId = req.body.deleteNotif;

    if(userNotif.notification.find(n=>n.from !== selectedUserId)){
      return res.status(300).json('Not Found');
    }
    const updatedNotif = userNotif.notification.filter(
      (n) => n.from !== selectedUserId
    );
     

    await User.findByIdAndUpdate(userId, { notification: updatedNotif });
    return res.status(200).json(updatedNotif);
  } catch (err) {
    return res.status(400).json({ err: `err err err err err ${err}` });
  }
});
router.post("/addcontacts", Protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const selectedUserId = req.body.selectedUser;

    const userContacts = await User.findById(userId).select("contacts");
    const selectedUserContacts = await User.findById(selectedUserId).select(
      "contacts"
    );

    if (!userContacts.contacts.includes(selectedUserId)) {
      await User.findByIdAndUpdate(userId, {
        contacts: userContacts.contacts.concat(selectedUserId),
      });
    }
    if (!selectedUserContacts.contacts.includes(userId)) {
      await User.findByIdAndUpdate(selectedUserId, {
        contacts: selectedUserContacts.contacts.concat(userId),
      });
    }

    return res.status(200).json("updated");
  } catch (err) {
    return res.status(400).json({ err: `err err err err err ${err}` });
  }
});

router.get("/allcontacts", Protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const cont = await User.findById(userId);
    const usersGrp = [];

    for (const selUsers of cont.contacts) {
      const selUser = await User.findById(selUsers)
        .select("-notification")
        .select("-contacts")
        .select("-password")
        .select("-about");

      const messages = await Mess.find({
        $or: [
          { from: userId, to: selUsers },
          { from: selUsers, to: userId },
        ],
      });
      if (messages.length > 0) {
        usersGrp.push({
          _id: selUser._id,
          name: selUser.name,
          pic: selUser.pic,
          lastMess: messages[messages.length - 1].message,
          createdAt: messages[messages.length - 1].createdAt,
        });
      } else {
        usersGrp.push({
          _id: selUser._id,
          name: selUser.name,
          pic: selUser.pic,
          lastMess: "",
          createdAt: "",
        });
      }
    }
    return res.status(200).json(usersGrp);
  } catch (err) {
    return res.status(400).json({ err: `all contacts ${err}` });
  }
});

router.delete("/deletecontact", Protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const selectedUser = req.body.deleteUser;
    if (!selectedUser) {
      return res.status(300);
    }
    const cont = await User.findById(userId).select("contacts");
    const updatedCont = cont.contacts.filter((c) => c !== selectedUser);
    await User.findByIdAndUpdate(userId, { contacts: updatedCont }); // delete single contact

    await Mess.deleteMany({
      $or: [{ to: selectedUser }, { from: selectedUser }],
    }); // delete user all messages
    return res.status(200).json(selectedUser);
  } catch (err) {
    return res.status(400).json({ err: `err err err err err ${err}` });
  }
});
module.exports = router;
