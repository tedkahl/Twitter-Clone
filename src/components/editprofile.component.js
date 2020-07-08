import React, {Component} from 'react'
import axios from 'axios'
import "bootstrap/dist/css/bootstrap.min.css";
import {server} from '../util/env'

/*Displays a form for editing a new user profile. Data validation performed on the back end.*/
export default class EditProfile extends Component{
    constructor(props){
        super(props)
        this.onChange=this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.state={
            user:props.user,
            updateuser:props.updateuser
        }
    }

    onChange(event){
        let updated=this.state.user;
        let name=event.target.name;
        let value=event.target.value;
        
        updated[name]=value;
        this.setState({user:updated});
    }

    onSubmit(event){
        event.preventDefault();
        console.log(this.state.user);
        axios.post(`${server}/api/users/edit`, this.state.user,{withCredentials:true})
            .then(res=>{console.log(res.data)
                this.state.updateuser(this.state.user);
            })
            .catch(err=>{console.log(err.response)});
    }

    render(){
        return(
            <div>
                <h3>Edit Profile</h3>
                <form onSubmit={this.onSubmit}>
                <div className="form-group">
                    <label>Username:</label>
                    <input type='text'
                           name='username'
                           onChange={this.onChange}
                           value={this.state.user.username}>
                    </input>
                </div>
                <div className="form-group">
                    <label>Bio:</label>
                    <textarea
                           name='bio'
                           style={{height:100}}
                           onChange={this.onChange}
                           value={this.state.user.bio}>
                    </textarea>
                </div>
                <div className="form-group">
                    <label>New Password:</label>
                    <input type='password'
                           name='password'
                           onChange={this.onChange}>
                    </input>
                </div>
                <div className="form-group">
                    <label>Repeat Password:</label>
                    <input type='password'
                           name='repeat_password'
                           onChange={this.onChange}>
                    </input>
                </div>
                    <input type="submit" value="Submit" className="btn btn-primary"/>
                </form>
            </div>
        )
    }
}
