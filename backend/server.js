const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

// Connect backend VM to database VM
mongoose
  .connect("mongodb://10.0.0.30:27017/fitconnect")
  .then(() => console.log("Connected to MongoDB database"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User model
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("User", userSchema);

// Register route
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: "Account created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login route
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      name: user.name,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("FitConnect backend is running");
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Backend running on port 3000");
});
