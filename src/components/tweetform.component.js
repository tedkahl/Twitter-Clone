import React, {Component} from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';
import {server} from '../util/env'

/*Form to post a new tweet, used in home page*/
export default class TweetForm extends Component{
    constructor(props){
        super(props);
        this.onChangeText=this.onChangeText.bind(this);
        this.onSubmit=this.onSubmit.bind(this);
        this.state={
            text:""
        }
    }

    onChangeText= e=>{
        this.setState({
            text:e.target.value
        })
    }

    onSubmit(e){
        e.preventDefault();

        console.log(this.state);

        let data={
            text:this.state.text,
            date:Date.now().valueOf()
        }

        axios.post(`${server}/api/tweets/`,data,{withCredentials:true})
            .then(res=>{console.log(res.data)})
            .catch(err=>{console.log(err.response)});
    }

    render(){
        return(
        <div>
            <form onSubmit={this.onSubmit}>
            <div className="form-group">
                <label>What's on your mind?:</label>
                 <input type="text"
                    className="form-control"
                    onChange={this.onChangeText}/>
                    </div>
                    <div className="form-group">
                        <input type="submit" value="Tweet!" className="btn btn-primary"/>
                    </div>
            </form>
        </div>
        )
    }
}