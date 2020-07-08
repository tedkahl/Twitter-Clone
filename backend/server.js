var express = require('express');
var cors = require('cors');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

require('dotenv').config();

const app = express();
const port = process.env.SERVER_PORT || 3000;

/*let middleware=(req,res,next)=>{
  res.header("Access-Control-Allow-Origin","http://localhost:5000");
  console.log(req.method==='OPTIONS')
  console.log(req.headers["origin"])
  console.log(req.headers['access-control-request-method'])
  console.log(res.getHeaders());
  //res.append("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
}*/
let corsoptions={origin:'http://localhost:5000',
credentials:true,
methods:"GET,PUT,POST,DELETE"
}
app.options('*',cors(corsoptions));
app.use(cors(corsoptions));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
//app.use(middleware);

const uri = process.env.ATLAS_URI;
//disable autoindex and add needed indices manually.
mongoose.connect(uri, {useNewUrlParser:true, useCreateIndex: true, autoIndex: false}
).then(()=>console.log("MongoDB database connection established successfully"))
.catch((err)=>console.error("Could not connect to MongoDB"));

//const mainRouter=require('./routes/mainRouter.js');
const usersRouter=require('./routes/users.route');
const tweetsRouter=require('./routes/tweets.route');
//const testsRouter=require('./routes/tests.route');

//app.use(mainRouter);
app.use("/api/users",usersRouter);
app.use("/api/tweets",tweetsRouter);
//app.use("/tests",testsRouter);

app.listen(port,()=>{
    console.log(`Server is running on port: ${port}`); //"template literal"
});