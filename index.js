const express = require('express');
const server = express();
// import cors from cors ;
const mongoose = require('mongoose');

const productsRouter = require('./routes/Products');
const categoriesRouter = require('./routes/Categories');
const usersRouter = require('./routes/User');
const authRouter = require('./routes/Auth');
const cartRouter = require('./routes/Cart');
const ordersRouter = require('./routes/Order');
const cors = require('cors')


server.use(express.json());
server.use(cors())
server.use('/products', productsRouter.router);
server.use('/categories', categoriesRouter.router)
server.use('/users', usersRouter.router)
server.use('/auth', authRouter.router)
server.use('/cart', cartRouter.router)
server.use('/orders', ordersRouter.router)

server.use(express.static('build'));

main().catch(err=> console.log(err));

async function main(){
    await mongoose.connect('mongodb+srv://shivang_4857:yQeCKxnqJH2GWIdG@cluster0.yqamvwn.mongodb.net/ecommerce');
    console.log('database connected')
}

server.get('/',(req, res)=>{
    res.json({status:'success'})
})

server.listen(8080, ()=>{
    console.log('server started')
})


 