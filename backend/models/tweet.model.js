const mongoose=require('mongoose');
const Joi=require('@hapi/joi');

const id={
    type:String,
    length:24,
    required:true
}

const tweetSchema = new mongoose.Schema({
    original_tweeter:id,
    date:{type:Number,required:true},
    text:{type:String, minlength:1,maxlength:280,required:true},
    tweeted_by:{
        type:[{_id:0, id:id, date:{type:Number, required:true}}], //includes retweets
        minlength:1,required:true},
    liked_by:[id],    
    likes:{type:Number,default:0},
    retweets:{type:Number,default:0},
    //images:Boolean
},{
    timestamps:true
});
tweetSchema.index({"date":-1});
tweetSchema.index({"original_tweeter":1,"date":-1});
const Tweet = mongoose.model('Tweet',tweetSchema);

function validateTweet(tweet) {
    const schema = Joi.object({
      original_tweeter: Joi.string().length(24).alphanum().required(),
      tweeted_by: Joi.array().min(1).required(),
      text: Joi.string().min(1).max(280).required(),
      date:Joi.number().required()
    })
  return schema.validate(tweet);
}

exports.Tweet=Tweet;
exports.validate=validateTweet; //no parentheses here remember that