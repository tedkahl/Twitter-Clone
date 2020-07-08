const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const { User, validate } = require("../models/user.model");
const { Tweet } = require("../models/tweet.model");
const express = require("express");

const {combineArrays,reverseArray, processUser} = require("../util/util")
const router = express.Router();

require('dotenv').config();

//auth is the first callback, which decides whether to pass to the next one. router.METHOD() can take any number
//of callbacks

router.get("/current", auth, (req, res) => {
  User.findById(req.user._id).select("-password -tweets") //find the user in database by id, return without password
    .then((user)=>res.json(user))
    .catch(err=> res.status(400).json(err));
});

/*Get all data necessary to display user page. Done in one trip for efficiency.*/
router.get("/userpage/:username/:limit", (req, res) => {
  User.findOne({ username: req.params.username }).select("-password") //find user
    .then(user => {
      user.tweets=user.tweets||[];
      reverseArray(user.tweets);  //display in chronological order
      let end=Math.min(req.params.limit,user.tweets.length)
      let tweetlist = user.tweets.slice(0,end) 
        .map(tweet=>{return tweet.id}); //get ids of the most recent tweets up to limit
        
        Tweet.find({ _id: { $in: tweetlist } }) //get data for tweets in tweetlist
        .then(tweets=>{
          let idlist=combineArrays(user.following,user.followers,
            tweets.map(tweet=>{return tweet.original_tweeter})) //get ids of users whose information must be retrieved
            
          User.find({ _id: { $in: idlist } }).select("username _id bio follower_count") //get user information, then return
          .then(other_users => {
            return res.json({
              user: user,
              other_users: other_users,
              tweets: tweets,
            });
          })
        })
      .catch(err=>res.status(400).json(err.message));
      
    })
  })

  //takes all tweets from followed users in {id:x date:y} format and returns timeline in order
  //for homepage route
  var assembleTimeline=(tweetlists)=> {
    let date,ind,timeline=[];
    let top=(i)=>{return (tweetlists.length>0&&tweetlists[i].length>0)? tweetlists[i][tweetlists[i].length-1].date 
                  :-1}; //return most recent tweet from user if list not yet empty
    
    while(date!=-1 && timeline.length<1000)
    {
      date=top(0);
      ind=0;
      for(let i=1;i<tweetlists.length;i++){
        if(top(i)>date){
          date=top(i);
          ind=i;
        }
      }
      if(date!=-1) timeline.push(tweetlists[ind].pop());
    }
    return timeline;
  }

/*Gets all data for homepage. Done in one trip for efficiency.*/
router.get("/homepage/:limit", auth, (req, res) => {
  User.findById(req.user._id).select("-password")
    .then(user => {

      User.find({ _id: { $in: user.following } }).select("username _id bio follower_count tweets") 
        .then(following => {
          let timeline = assembleTimeline(following.map(user => { return user.tweets?user.tweets:[] })) 
          let tweetlist = timeline.slice(0, Math.min(req.params.limit, timeline.length)).map(tweet => { return tweet.id });
          
          for(x of following) x.tweets=0; //these can be long and are redundant with combined timeline

          Tweet.find({ _id: { $in: tweetlist } })
            .then(tweets => {
              let idlist = combineArrays(user.followers,
                tweets.map(tweet => { return tweet.original_tweeter }))

              User.find({ _id: { $in: idlist } }).select("username _id bio follower_count")
                .then(other_users => {
                  return res.json({
                    user: user,
                    other_users: following.concat(other_users),
                    tweets: tweets,
                    timeline: timeline
                  });

                })
                .catch(err => res.status(400).json(err.message));

            })
        })
      })
    })

router.get("/finduser/:id", (req, res) => {
  User.findById(req.params.id).select("-password") //find the user in database by id, return without password
    .then((user)=>res.json(user))
    .catch(err=> res.status(400).json(err.message));
});

//Follow :id and update both profiles
router.get("/follow/:id", auth, (req,res)=>{
  if(req.params.id==req.user._id) return res.status(400).json("You can't follow yourself!");
  let response="";
  let query=User.where({_id:req.params.id,followers:{$nin:req.user._id}});
  
  query.updateOne({$addToSet:{followers:req.user._id},$inc:{follower_count:1}}, (err,writeOpResult)=>{
    if(err) return res.status(400).json(err);
    response+="Modified: "+writeOpResult.nModified+" ";

    let query2= User.where({_id:req.user._id, following:{$nin:req.params.id}});
    query2.updateOne({$addToSet:{following:req.params.id}},(err,writeOpResult)=>{
        if(err) return res.status(400).json(err);
        response+="Modified: "+writeOpResult.nModified+" "; 
        res.json(response); 
      })
    })
});

//Unfollow :id and update both profiles
router.get("/unfollow/:id", auth, (req,res)=>{
  if(req.params.id==req.user._id) return res.status(400).json("You can't unfollow yourself!");
  let response="";
  User.where({_id:req.params.id,followers:{$in:req.user._id}})
  .updateOne({$pull:{followers:req.user._id},$inc:{follower_count:-1}}, (err,writeOpResult)=>{
    if(err) return res.status(400).json(err);
    response+="Modified: "+writeOpResult.nModified+" ";

    User.where({_id:req.user._id, following:{$in:req.params.id}})
    .updateOne({$pull:{following:req.params.id}},(err,writeOpResult)=>{
        if(err) return res.status(400).json(err);
        response+="Modified: "+writeOpResult.nModified+" "; 
        res.json(response); 
      })
    })
});

//Delete a user. Requires login as user or admin access
router.delete("/:id",auth,(req,res)=>{
    if(req.user._id!=req.params.id&&req.user.isAdmin==false)
      return res.status(400).json("Wrong user");

    User.findByIdAndDelete(req.params.id).select("following")
      .then((user)=>{
          User.updateMany({_id:{$in:user.following}}
          ,{$pull:{followers:req.params.id},$inc:{follower_count:-1}},(err,response)=>{
            if(err) res.status(400).json(err);
            res.json("Deleted. Updated "+response.nModified+" profiles.");
          })
      })
      .catch(err=> res.status(400).json('Error: '+err));
});

//returns a specified number of the most popular users
router.get("/popular/:num", (req, res) => {
  console.log("getting popular users");
  var num=(req.params.num&&req.params.num>0)?req.params.num:10;
  num=parseInt(num,10);
  
  User.find({}).sort({follower_count:-1}).limit(num).select("_id username ")
    .then(userlist=>res.json(userlist))
    .catch(err=>res.status(400).json(err));
});

router.get("/signout",(req,res)=>{
  res.clearCookie("x-access-token")
    .clearCookie("userid")
    .send("Signout successful.");
})

//updates a user profile. Must be logged in as that user.
router.post("/edit",auth,async(req,res)=>{
  pwd=!!(req.body.password) //if password is not included, use a dummy password for validation, but don't save it

  if(!req.body.password){
    req.body.password='1234';
    req.body.repeat_password='1234';
  }

  const { error } = validate(req.body);
  if (error) return res.status(400).json("Failed validation:"+error.details[0].message);

  //find an existing user
  let user = await User.findOne({ username: req.body.username });
  if (user && user._id!=req.user._id) return res.status(400).json("Username already taken.");
  
  updates={ username:req.body.username,
    bio:req.body.bio }
  if(pwd) updates['password']=await bcrypt.hash(req.body.password, 10);
  console.log(updates);
  User.findByIdAndUpdate(req.user._id,updates)
    .then(()=>res.json('User Updated!'))
    .catch(err=> res.status(400).json('Error: '+err));
});



router.post("/signin", async (req,res)=>{
  User.findOne({username:req.body.username})
  .then((user)=>{
    if(bcrypt.compareSync(req.body.password,user.password))
    {
      const token=user.generateAuthToken();
      res.cookie("x-access-token", token,{httpOnly:true,maxAge:Date.now().valueOf()+86400000});
      
      console.log(res.getHeaders());
      res.cookie("userid",""+user._id,{maxAge:Date.now().valueOf()+86400000})
      .send({user:processUser(user)}); 
    }
    else{
      res.status(400).json("Incorrect password")
    }
    
  })
  .catch(err=>res.status(400).json(err.message));
})

//create new user
router.post("/", async (req, res) => {
  // validate the request body first
  console.log("adding user");
  const { error } = validate(req.body);
  if (error) return res.status(400).json("Failed validation:"+error.details[0].message);

  //find an existing user
  let user = await User.findOne({ username: req.body.username });
  if (user) return res.status(400).json("Username already taken.");

  user = new User({
    username: req.body.username,
    password: req.body.password,
    join_date:req.body.join_date,
    bio:req.body.bio,
    isAdmin:req.body.isAdmin,
    following:req.body.following,
    tweets:[]
  });
  user.password = await bcrypt.hash(user.password, 10);
  
  
  let saved = await new Promise((resolve, reject) => {
    user.save((err, result) => {
      if(err) console.log(err);
      resolve(result);
    })
  })

  await User.updateMany({_id:{$in:user.following},followers:{$nin:saved._id}},
    {$addToSet:{followers:saved._id},$inc:{follower_count:1}},(err,res)=>{
      if(err) res.status(400).json("error updating followers");
    })

  const token = user.generateAuthToken();
  res.cookie("x-access-token", token,{httpOnly:true,maxAge:Date.now().valueOf()+86400000})
  .cookie("userid",saved._id,{maxAge:Date.now().valueOf()+86400000})
  .json({user:processUser(saved)});

});

module.exports = router;