import React, {Component} from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';
import Timeline,{getNames,handleTimeline} from './timeline.component';
import {limit,server} from '../util/env'
import TweetForm from './tweetform.component';

/*The home page shows tweets  and retweets from users the logged-in user follows in chronological order. 
Also allows the logged-in user to post new tweets.*/
export default class HomePage extends Component{
    constructor(props){
        super(props);
        this.state={
            user:props.user,
            loaded:false,
            timeline:[],
            tweets:[],
            limit:limit,
            updateuser:props.updateuser,
            names:{} //reference for usernames based on id. names.id=username for each user
        }
    }    

    componentDidMount(){
        axios.get(`${server}/api/users/homepage/${this.state.limit}`,{withCredentials:true})
        .then(found=>{
            let names=getNames(found.data.other_users);
            let tl=handleTimeline(found.data.user._id,found.data.timeline,
                                    found.data.tweets,0,this.state.limit);
            this.state.updateuser({
                    username: found.data.user.username,
                    id: found.data.user._id,
                    bio: found.data.user.bio,
                    join_date: found.data.user.join_date,
                    followers: found.data.user.followers,
                    following: found.data.user.following,
                });
            this.setState({
                names:names,
                timeline:found.data.timeline,
                tweets:tl,
                loaded: true
            }, () => {
                console.log("state:")
                console.log(this.state);
            })
        })
        .catch(err=>{
            if(err.response.status==401)
                window.location="/signin"
        });
                 
}   
    
    testTweet()
    {
        let rand = Math.floor(Math.random() * 100000);
        let text=rand.toString();
        this.postTweet(text);
    }

    postTweet(text)
    {
        let data = { text: text, date: new Date().valueOf() };
        axios.post(`${server}/api/tweets/`,data,{withCredentials:true})
            .then(res=>{console.log(res.data)})
            .catch(err=>{console.log(err.response)});
    }

    loadTweetForm(){ return this.state.loaded?<TweetForm/>:<p>Loading...</p>;}

    loadTimeline(){ return this.state.loaded?<Timeline 
                                timeline={this.state.timeline} 
                                tweets={this.state.tweets} 
                                names={this.state.names}
                                limit={this.state.limit}
                                />
        :<p>Loading...</p>;}
 
    render() {
        return (
            <div className="container">
                <div className="container">
                    <h2>{this.state.user.username}</h2>
                    <p>{this.state.user.bio}</p>
                    <div className="row">
                        <p className="col">Joined: {new Date(this.state.user.join_date).toDateString().slice(3)}</p>
                        <p className="col">Followers: {this.state.user.followers.length}</p>
                    </div>
                </div>
                <div className="container">

                    <button onClick={() => this.testTweet()}>test tweet</button>

                    {this.loadTweetForm()}

                    <div className="timeline">
                        {this.loadTimeline()}
                    </div>
                </div>
            </div>
        )
    } 
}
