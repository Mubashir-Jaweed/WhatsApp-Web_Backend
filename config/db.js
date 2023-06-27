const mongoose = require("mongoose")
const colors = require("colors");

const connectDB = async () =>{
    try {
        const conn = await mongoose.connect(
          "mongodb+srv://Mubashir:35697008@cluster0.121vi.mongodb.net/?retryWrites=true&w=majority",
          {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          }
        );

        console.log(`mongodb connect Successfully on ${conn.connection.host}`.cyan)
    } catch (err) {
        console.log(`db error ${err}`)
        process.exit()
    }
}


module.exports = connectDB