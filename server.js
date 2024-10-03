const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();
const https = require("https");
const express = require("express");
const helmet = require("helmet");
const path = require("path");
const passport = require("passport");
const cookieSession = require("cookie-session");
const { Strategy } = require("passport-google-oauth20");

const PORT = 8000;
const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  COOKIE_KEY_1: process.env.COOKIE_KEY_1,
  COOKIE_KEY_2: process.env.COOKIE_KEY_2,
};

passport.use(
  new Strategy(
    {
      clientID: config.CLIENT_ID,
      clientSecret: config.CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    // this function will be called after the oauth is done
    function verifyCallback(accessToken, refreshToken, profile, done) {
      // here if we have database we can also insert the profile details in the database
      console.log(profile);
      done(null, profile);
    }
  )
);

// Save the session to the cookie
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Read the session from the cookie
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

const app = express();

function checkLoggedIn(req, res, next) {
  const isLoggedIn = req.isAuthenticated() && req.user; // if req.user is not defined then it is not logged in
  if (!isLoggedIn) {
    return res.status(401).json({
      error: "you must log in!",
    });
  }
  next();
}

app.use(helmet());
app.use(
  cookieSession({
    name: "cookie",
    maxAge: 24 * 60 * 60 * 1000,
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2],
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/secret", checkLoggedIn, (req, res) => {
  return res.send("Your personal secret value is 42!");
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email"],
  })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failure",
    successRedirect: "/",
    session: true, // by default true
  }),
  (req, res) => {
    console.log("google called us!!");
  }
);
app.get("/auth/logout", (req, res) => {
  req.logout(); // Removes req.user and clears any logged in session
  return res.redirect("/");
});

const server = https.createServer(
  {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
  },
  app
);

server.listen(PORT, () => {
  console.log(`the server is listening on ${PORT}...`);
});
