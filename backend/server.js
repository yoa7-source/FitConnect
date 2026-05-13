const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(express.json());
app.use(cors());

// Logging helper
function writeLog(message) {
  const timestamp = new Date().toISOString();

  fs.appendFileSync(
    "auth.log",
    `[${timestamp}] ${message}\n`
  );
}

// Input sanitization helper
function cleanInput(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

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

const routineSchema = new mongoose.Schema({
  userEmail: String,
  routineName: String,
  exercises: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Routine = mongoose.model("Routine", routineSchema);

const User = mongoose.model("User", userSchema);

const progressSchema = new mongoose.Schema({
  userEmail: String,
  calories: Number,
  bpm: Number,
  duration: Number,
  date: {
    type: Date,
    default: Date.now,
  },
});

const Progress = mongoose.model("Progress", progressSchema);

// Register route
app.post("/api/register", async (req, res) => {
  try {
    const name = cleanInput(req.body.name);
    const email = cleanInput(req.body.email);
    const password = cleanInput(req.body.password);

    if (!name || !email || !password) {
      writeLog("REGISTER FAILED: missing fields");

      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (!email.includes("@")) {
      writeLog(`REGISTER FAILED: invalid email - ${email}`);

      return res.status(400).json({
        message: "Invalid email address",
      });
    }

    if (password.length < 8) {
      writeLog(`REGISTER FAILED: weak password - ${email}`);

      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      writeLog(`REGISTER FAILED: email already registered - ${email}`);

      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: name,
      email: email,
      password: hashedPassword,
    });

    await user.save();

    writeLog(`REGISTER SUCCESS: ${email}`);

    res.status(201).json({
      message: "Account created successfully",
    });
  } catch (error) {
    writeLog(`REGISTER ERROR: ${error.message}`);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// Login route
app.post("/api/login", async (req, res) => {
  try {
    const email = cleanInput(req.body.email);
    const password = cleanInput(req.body.password);

    if (!email || !password) {
      writeLog("LOGIN FAILED: missing credentials");

      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (!email.includes("@")) {
      writeLog(`LOGIN FAILED: invalid email - ${email}`);

      return res.status(400).json({
        message: "Invalid email address",
      });
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      writeLog(`LOGIN FAILED: user not found - ${email}`);

      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      writeLog(`LOGIN FAILED: wrong password - ${email}`);

      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();

    writeLog(`MFA CODE GENERATED for ${email}: ${mfaCode}`);

    res.json({
      message: "Password accepted. MFA required.",
      name: user.name,
      email: user.name,
      mfaCode: mfaCode,
    });
  } catch (error) {
    writeLog(`LOGIN ERROR: ${error.message}`);

    res.status(500).json({
      message: "Server error",
    });
  }
});

app.post("/api/ai-routine", (req, res) => {
  const goal = cleanInput(req.body.goal).toLowerCase();
  const level = cleanInput(req.body.level).toLowerCase();
  const days = Number(req.body.days);

  if (!goal || !level || !days) {
    return res.status(400).json({
      message: "Goal, level, and days are required",
    });
  }

  let routine = [];

  if (goal === "muscle gain") {
    routine = [
      "Bench Press - 4 sets of 8 reps",
      "Squats - 4 sets of 8 reps",
      "Deadlifts - 3 sets of 6 reps",
      "Shoulder Press - 3 sets of 10 reps",
      "Pull-Ups - 3 sets to failure",
    ];
  } else if (goal === "fat loss") {
    routine = [
      "Jump Rope - 10 minutes",
      "Burpees - 3 sets of 15",
      "Mountain Climbers - 3 sets of 30 seconds",
      "Bodyweight Squats - 4 sets of 20",
      "Treadmill Intervals - 15 minutes",
    ];
  } else if (goal === "endurance") {
    routine = [
      "Jogging - 25 minutes",
      "Cycling - 20 minutes",
      "Plank - 3 sets of 60 seconds",
      "Walking Lunges - 3 sets of 20",
      "Rowing Machine - 15 minutes",
    ];
  } else {
    routine = [
      "Push-Ups - 3 sets of 12",
      "Squats - 3 sets of 15",
      "Plank - 3 sets of 45 seconds",
      "Lunges - 3 sets of 12 each leg",
      "Light Cardio - 20 minutes",
    ];
  }

  writeLog(`AI ROUTINE GENERATED: goal=${goal}, level=${level}, days=${days}`);

  res.json({
    message: "Routine generated successfully",
    goal,
    level,
    days,
    routine,
  });
});

app.post("/api/routines", async (req, res) => {
  try {
    const userEmail = cleanInput(req.body.userEmail);
    const routineName = cleanInput(req.body.routineName);
    const exercises = req.body.exercises;

    if (!userEmail || !routineName || !exercises.length) {
      return res.status(400).json({
        message: "Missing routine data",
      });
    }

    const routine = new Routine({
      userEmail,
      routineName,
      exercises,
    });

    await routine.save();

    writeLog(`ROUTINE CREATED: ${userEmail} - ${routineName}`);

    res.status(201).json({
      message: "Routine saved successfully",
    });

  } catch (error) {
    writeLog(`ROUTINE ERROR: ${error.message}`);

    res.status(500).json({
      message: "Server error",
    });
  }
});

app.get("/api/routines/:email", async (req, res) => {
  try {
    const email = cleanInput(req.params.email);

    const routines = await Routine.find({
      userEmail: email,
    });

    res.json(routines);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});

//progress model
app.post("/api/progress", async (req, res) => {
  try {
    const userEmail = cleanInput(req.body.userEmail);
    const calories = Number(req.body.calories);
    const bpm = Number(req.body.bpm);
    const duration = Number(req.body.duration);

    if (!userEmail || !calories || !bpm || !duration) {
      return res.status(400).json({
        message: "All progress fields are required",
      });
    }

    const progress = new Progress({
      userEmail,
      calories,
      bpm,
      duration,
    });

    await progress.save();

    writeLog(`PROGRESS ADDED: ${userEmail}`);

    res.status(201).json({
      message: "Progress entry saved",
    });
  } catch (error) {
    writeLog(`PROGRESS ERROR: ${error.message}`);

    res.status(500).json({
      message: "Server error",
    });
  }
});

//comment
const commentSchema = new mongoose.Schema({
  routineId: String,
  userEmail: String,
  commentText: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Comment = mongoose.model("Comment", commentSchema);

app.get("/api/progress/:email", async (req, res) => {
  try {
    const email = cleanInput(req.params.email);

    const progress = await Progress.find({
      userEmail: email,
    }).sort({ date: 1 });

    res.json(progress);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});

app.get("/api/users/search", async (req, res) => {
  try {
    const query = cleanInput(req.query.q);

    if (!query) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    }).select("name email");

    writeLog(`USER SEARCH: ${query}`);

    res.json(users);
  } catch (error) {
    writeLog(`USER SEARCH ERROR: ${error.message}`);

    res.status(500).json({
      message: "Server error",
    });
  }
});

//comment route
app.post("/api/comments", async (req, res) => {
  try {
    const routineId = cleanInput(req.body.routineId);
    const userEmail = cleanInput(req.body.userEmail);
    const commentText = cleanInput(req.body.commentText);

    if (!routineId || !userEmail || !commentText) {
      return res.status(400).json({
        message: "Missing comment data",
      });
    }

    const comment = new Comment({
      routineId,
      userEmail,
      commentText,
    });

    await comment.save();

    writeLog(`COMMENT ADDED: ${userEmail}`);

    res.status(201).json({
      message: "Comment added successfully",
    });
  } catch (error) {
    writeLog(`COMMENT ERROR: ${error.message}`);

    res.status(500).json({
      message: "Server error",
    });
  }
});

app.get("/api/comments/:routineId", async (req, res) => {
  try {
    const routineId = cleanInput(req.params.routineId);

    const comments = await Comment.find({
      routineId: routineId,
    }).sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});


//admin route 

app.get("/api/admin/users", async (req, res) => {
  try {
    const users = await User.find().select("name email");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/admin/users/:id", async (req, res) => {
  try {
    const name = cleanInput(req.body.name);
    const email = cleanInput(req.body.email);

    await User.findByIdAndUpdate(req.params.id, {
      name,
      email,
    });

    writeLog(`ADMIN UPDATED USER: ${email}`);

    res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/admin/comments", async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/admin/comments/:id", async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);

    writeLog(`ADMIN REMOVED COMMENT: ${req.params.id}`);

    res.json({ message: "Comment removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

//exercise route for API
const exercises = [
  {
    name: "Push Up",
    muscle: "Chest",
    difficulty: "Beginner",
    instructions: "Keep your body straight, lower yourself, then push back up."
  },
  {
    name: "Squat",
    muscle: "Legs",
    difficulty: "Beginner",
    instructions: "Keep your back straight, lower your hips, then stand back up."
  },
  {
    name: "Bench Press",
    muscle: "Chest",
    difficulty: "Intermediate",
    instructions: "Lower the bar to your chest and press it back up."
  },
  {
    name: "Deadlift",
    muscle: "Back",
    difficulty: "Advanced",
    instructions: "Lift the bar from the floor while keeping your back neutral."
  },
  {
    name: "Plank",
    muscle: "Core",
    difficulty: "Beginner",
    instructions: "Hold your body straight while resting on forearms and toes."
  }
];

app.get("/api/exercises/search", (req, res) => {
  const query = cleanInput(req.query.q).toLowerCase();

  if (!query) {
    return res.status(400).json({
      message: "Search query is required"
    });
  }

  const results = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(query) ||
    exercise.muscle.toLowerCase().includes(query) ||
    exercise.difficulty.toLowerCase().includes(query)
  );

  writeLog(`EXERCISE SEARCH: ${query}`);

  res.json(results);
});

// Health check
app.get("/", (req, res) => {
  res.send("FitConnect backend is running");
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Backend running on port 3000");
});
