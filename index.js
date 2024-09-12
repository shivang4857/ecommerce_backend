const express = require('express');
const User = require('./model/User');
const server = express();
// import cors from cors ;
const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;

const productsRouter = require('./routes/Products');
const categoriesRouter = require('./routes/Categories');
const usersRouter = require('./routes/User');
const authRouter = require('./routes/Auth');
const cartRouter = require('./routes/Cart');
const ordersRouter = require('./routes/Order');
const cors = require('cors')
const session = require('express-session');
const passport = require('passport');
const { isAuth, sanitizeUser } = require('./services/common');


server.use(express.json());
server.use(cors())
server.use('/products', isAuth(), productsRouter.router);
// we can also use JWT token for client-only auth
server.use('/categories', isAuth(), categoriesRouter.router);
server.use('/brands', isAuth(), brandsRouter.router);
server.use('/users', isAuth(), usersRouter.router);
server.use('/auth', authRouter.router);
server.use('/cart', isAuth(), cartRouter.router);
server.use('/orders', isAuth(), ordersRouter.router);
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const SECRET_KEY = 'SECRET_KEY';
// JWT options
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = SECRET_KEY; // TODO: should not be in code;

server.use(
    session({
      secret: 'keyboard cat',
      resave: false, // don't save session if unmodified
      saveUninitialized: false, // don't create session until something stored
    })
  );
  server.use(passport.authenticate('session'));

  passport.use(
    'local',
    new LocalStrategy(async function (username, password, done) {
      // by default passport uses username
      try {
        const user = await User.findOne({ email: username });
        console.log(username, password, user);
        if (!user) {
          return done(null, false, { message: 'invalid credentials' }); // for safety
        }
        crypto.pbkdf2(
          password,
          user.salt,
          310000,
          32,
          'sha256',
          async function (err, hashedPassword) {
            if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
              return done(null, false, { message: 'invalid credentials' });
            }
            const token = jwt.sign(sanitizeUser(user), SECRET_KEY);
            done(null, token); // this lines sends to serializer
          }
        );
      } catch (err) {
        done(err);
      }
    })
  );
  
  passport.use(
    'jwt',
    new JwtStrategy(opts, async function (jwt_payload, done) {
      console.log({ jwt_payload });
      try {
        const user = await User.findOne({ id: jwt_payload.sub });
        if (user) {
          return done(null, sanitizeUser(user)); // this calls serializer
        } else {
          return done(null, false);
        }
      } catch (err) {
        return done(err, false);
      }
    })
  );

  passport.serializeUser(function (user, cb) {
    console.log('serialize', user);
    process.nextTick(function () {
      return cb(null, { id: user.id, role: user.role });
    });
  });

  passport.deserializeUser(function (user, cb) {
    console.log('de-serialize', user);
    process.nextTick(function () {
      return cb(null, user);
    });
  });


//server.use(express.static('build'));

main().catch(err=> console.log(err));

async function main(){
    await mongoose.connect(process.env.MONGO_URL);
    console.log('database connected')
}

passport.serializeUser(function (user, cb) {
    console.log('serialize', user);
    process.nextTick(function () {
      return cb(null, { id: user.id, role: user.role });
    });
  });

server.listen(8080, ()=>{
    console.log('server started')
})


 