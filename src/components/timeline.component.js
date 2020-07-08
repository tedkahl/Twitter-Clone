import React, {Component} from 'react';
import "bootstrap/dist/css/bootstrap.min.css"
import axios from 'axios';
import {convertDate, like, retweet} from '../util/util'
import {BrowserRouter as Route,Link} from "react-router-dom";
import {server} from '../util/env'

/*Timeline component which displays tweets. Used in homepage and userpage. Tweets are displayed up to the
specified limit*/
export default class Timeline extends Component{
    constructor(props){
        super(props);
        this.state={
            timeline:props.timeline,
            tweets:props.tweets,
            names:props.names,
            userid:props.userid?props.userid:0,
            limit:props.limit
        }
    }

    retweet(index){
        let id=this.state.tweets[index].id;
        console.log(id);
        retweet(id)
            .then(() => {
                let timel = this.state.tweets;
                timel[index].retweets++;
                this.setState({ tweets: timel });
            })
            .catch(err => console.log(err))
    }

    like(index, operation) {
        let liked = (operation == "like");
        let id=this.state.tweets[index].id;
        console.log(id);
        like(id, operation)
            .then(() => {
                let timel = this.state.tweets;
                timel[index].liked = liked;
                timel[index].likes += (liked ? 1 : -1);
                this.setState({ tweets: timel });
            })
            .catch(err => console.log(err))
    }


    getMore()
    {
        let start=this.state.tweets.length;
        let end=start+this.state.limit;
        let next=this.state.timeline.slice(start,end).map(tweet=>tweet.id);
        console.log("getting tweets")
        console.log(next);
        axios.post(`${server}/api/tweets/getmore`,{ids:next})
        .then(newtweets=>{
            let t=this.state.tweets;
            t = t.concat(handleTimeline(this.state.userid,this.state.timeline,
                newtweets.data,t.length,this.state.limit))
            this.setState({tweets:t});
        })
        .catch(err=>console.log(err))
    }

    render(){
        console.log("timeline state:")
        console.log(this.state);

        let timel=this.state.tweets.map((t,i)=>{
            return Tweet({
                tweet:t,
                name:this.state.names[t.original_tweeter],
                tweeted_by_name:this.state.names[t.tweeted_by.id],
                index:i,
                like:this.like.bind(this),
                retweet:this.retweet.bind(this)})})
            
        return(
            <div>
                {timel}
                <p>
                {this.state.tweets.length<this.state.timeline.length?
                    <button className="btn btn-primary" onClick={()=>this.getMore()}>More</button>:null}
                </p>
            </div>
            )
    }
}

/*Tweet component used in timeline*/
function Tweet(props){
    return(
        <div key={props.index}>
            {props.tweet.is_retweet?
                <p style={{fontsize:'12'}}>Retweeted by {props.tweeted_by_name+" "
                +convertDate(props.tweet.tweeted_by.date)} </p>
                :null
            }
            <h3><Link to={`/user/${props.name}`}>{props.name}</Link> {convertDate(props.tweet.date)}</h3> 
            <p style={{width:'200', fontsize:'14'}}>{props.tweet.text}</p>
            <p>Likes:{props.tweet.likes} Retweets:{props.tweet.retweets}</p>
            {props.tweet.liked?
                <button className="btn btn-danger" onClick={()=>props.like(props.index,"unlike")}>Unlike</button>
                :<button className="btn btn-primary" onClick={()=>props.like(props.index,"like")}>Like</button>}
            <button className="btn btn-success" onClick={()=>props.retweet(props.index)}>Retweet</button>
        </div>
    )
}

/*"timeline" is a list of tweet IDs, including both tweets and retweets, in the correct order 
they should be displayed. "Tweets" is the list of tweet objects from the database. 
This function maps timeline to a correctly-ordered and correct-length list of tweet objects to be displayed. */
export function handleTimeline(userid,timeline,tweets,start,length)
{
    let tweetref={};
    tweets.forEach(tweet=>{ tweetref[tweet._id]=tweet;})
    
    return timeline.slice(start,start+length).map((t)=>{
        let tweet=tweetref[t.id];
        return{
            id: tweet._id,
            original_tweeter: tweet.original_tweeter,
            date: new Date(tweet.date), 
            likes: tweet.likes,
            liked: (tweet.liked_by.includes(userid)),
            text: tweet.text,
            retweets: tweet.retweets,
            is_retweet:t.retweeter?true:false,
            tweeted_by: { id: t.retweeter?t.retweeter:tweet.original_tweeter, date: t.date },
        } 
      })
}

/*given a list of user objects, creates a map of id:username to be used when displaying tweets*/
export function getNames(userinfo)
{
    let names={};
    userinfo.forEach(user=>{names[user._id]=user.username})   
    return names;
}

