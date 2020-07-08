import React, {Component} from 'react';
import "bootstrap/dist/css/bootstrap.min.css"
import {BrowserRouter as Router, Route, Link} from "react-router-dom";

/*Page seen when no user is logged in. Shows Sign In and Create Profile buttons.*/
export default class FrontPage extends Component{
    constructor(props){
        super(props);
        this.state={
            id:this.props.id
        }
    }

    componentDidMount()
    {
        if(this.props.id)
            window.location="/homepage";
    }
    render(){
        return(
            <div className="d-flex">
                <Link to="/signin">
                    <div className="d-flex p-1">
                        <button className="btn btn-info">Sign in</button></div></Link>
                <Link to="/signup">
                    <div className="d-flex p-1">
                        <button className="btn btn-info">Create an account</button></div></Link>
            </div>
        )
    }
    
}