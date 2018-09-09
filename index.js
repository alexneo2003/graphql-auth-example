const { GraphQLServer } = require("graphql-yoga");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const ms = require("ms");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");
const { startDB, models } = require("./db");

const db = startDB({
  user: "*******",
  pass: "*******",
  url: "*******",
  db: "*******"
});

const typeDefs = `
  type Query {
    isLogin: Boolean!
  }
  type Mutation {
    signup(username: String!, email: String!, pwd: String!): Boolean!
    login(email: String!, pwd: String!): Boolean!
  }
`;

const resolvers = {
  Query: {
    isLogin: (parent, args, { req }) => typeof req.session.user !== "undefined"
  },
  Mutation: {
    signup: async (parent, { username, email, pwd }, { models }) => {
      const checkUser = await models.User.findOne({ email });
      if (checkUser) {
        throw new Error("Another User with same email exists.");
      }
      const pass = await bcrypt.hashSync(pwd, 10);
      await models.User({ username, email, pass }).save();
      return true;
    },
    login: async (parent, { email, pwd }, { req, models }) => {
      const user = await models.User.findOne({ email }).lean();
      if (!user) {
        throw new Error("No such user exist");
      }
      const verify = await bcrypt.compare(pwd, user.pass);
      if (!verify) {
        throw new Error("Incorrect password");
      }
      req.session.user = {
        ...user
      };
      return true;
    }
  }
};

// opts
const opts = {
  port: 4444,
  cors: {
    credentials: true,
    origin: ["http://localhost:8080"] // your frontend url.
  }
};

// context
const context = req => ({
  req: req.request,
  db,
  models
});

// server
const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context
});

const dbc = {
  user: "*******",
  pass: "*******",
  url: "*******",
  db: "*******"
};

// session middleware
server.express.use(
  session({
    name: "ex-qid",
    secret: `some-random-secret-here`,
    resave: true,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: ms("1d")
    },
    store: new MongoStore({
      url: `mongodb://${dbc.user}:${dbc.pass}@${dbc.url}/${dbc.db}`
    })
  })
);

// start server
server.start(opts, () =>
  console.log(`Server is running on http://localhost:${opts.port}`)
);
