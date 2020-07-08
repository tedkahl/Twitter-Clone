const auth = require("../middleware/auth");
const { Tweet, validate } = require("../models/tweet.model");
const { User } = require("../models/user.model");
const express = require("express");
const router = express.Router();
//auth is the first callback, which decides whether to pass to the next one. router.METHOD() can take any number
//of callbacks

//Get a list of tweets, passed as array in request body
router.post("/getmore", (req, res) => {
    Tweet.find({ _id: { $in: req.body.ids } })
        .then(tweets => res.json(tweets))
        .catch(err => res.status(400).json(err.message))
})

//updates a tweet, requiring login. Unused for now
router.post("/update/:id",auth,(req,res)=>{
    let tweet=Tweet.findById(req.params.id)
      .catch(err=> res.status(400).json('Error: '+err));

    if(tweet.username==req.user.username||req.user.isAdmin){
        tweet.text=req.body.text;
        tweet.save()
          .then(res.json("Saved!"))
          .catch(err=>res.status(400).json(err));
    }
    else res.status(400).json("Wrong user");
});

//Deletes a tweet. Unused for now.
router.delete("/:id",auth,(req,res)=>{
    Tweet.deleteOne({original_tweeter:req.user._id,_id:req.params.id})
    .then(result=>{
        if(result.deletedCount==1) res.status(200).send("deleted");
        else res.status(400).json("error")
    })
    .catch(err=>res.status(400).json(err.message));
});

//updateOne does not return a promise, so should use await instead
router.get("/unlike/:id",auth, async (req,res)=>{
    let r=await Tweet.updateOne({_id:req.params.id, liked_by:{$in:req.user._id}},{
        $inc:{likes:-1},
        $pull:{liked_by:req.user._id}
    })
    if(r.nModified==1) return res.json("success");
    else return res.status(400).json("error");
})

router.get("/like/:id",auth, async (req,res)=>{
    console.log("liking tweet")
    let r;
    try{
    r=await Tweet.updateOne({_id:req.params.id, liked_by:{$nin:req.user._id}},{
        $inc:{likes:1},
        $addToSet:{liked_by:req.user._id}
    })
    }
    catch(e){console.log(e)}   
    if(r.nModified==1) return res.json("success");
    else return res.status(400).json("error");
})

router.get("/retweet/:id",auth, async (req,res)=>{
    let date=new Date().valueOf();
    let r=await Promise.all([
        Tweet.updateOne({_id:req.params.id},{
        $inc:{retweets:1},
        $push:{tweeted_by:{id:req.user._id,date:date}}}), 
        addTweetToUser(req.user._id,req.params.id,date,true)
    ])

    if(r[1].nModified==1) return res.json("success");
    else return res.status(400).json("error");
})

//Unused for now
router.post("/unretweet/:id", auth, async (req, res) => {
    let r = await Promise.all([
        Tweet.find({ _id: req.params.id })
            .where('tweeted_by').in({ id: req.user._id, date: req.body.date })
            .updateOne({
                $inc: { retweets: -1 },
                $pull: { tweeted_by: { id: req.params.id, date: req.body.date } }
            }),

        User.updateOne({ _id: req.user._id }, { $pull: { tweets: { id: req.params.id, date: req.body.date, retweeter:req.user._id } } })
    ])
    if (r[0].nModified == 1) return res.json("success");
    else return res.status(400).json("error");
})

var addTweetToUser = (userid, tweetid, date, isretweet=false) => {
    return new Promise((resolve, reject) => {
        tweet={id:tweetid, date:date };
        if(isretweet) tweet["retweeter"]=userid;

        User.updateOne({ _id: userid }, {
            $push: { tweets: tweet }
        }, (err,result) => {
            if(err) reject(err.message);
            if (result.nModified == 1) resolve(result);
            else reject("nModified!=1");
        })
})}

//post a new tweet. 
router.post("/", auth, (req, res) => {
  let id=req.user._id;
  let date=req.body.date;
  tweet = new Tweet({
    original_tweeter: id,
    date:date,
    text:req.body.text,
    tweeted_by:[{id,date}]
  });

  tweet.save((err,result)=>{
    if(err) return res.status(400).json(err.message)

    addTweetToUser(id,result._id,date)
        .then(()=>res.json("tweet successful"))
        .catch(err=>{console.log(err)
        res.status(400).json(err.message)})
  })
});

module.exports = router;