import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import axios from "axios";
import { server } from "../util/env";

/*Sidebar seen by logged-in users. Displays user's name, links to home page, user page, edit profile and 
sign out*/
export default class SideBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: props.id,
      user: props.user,
      showPopUp: false,
    };
  }

  componentDidMount() {
    console.log("sidebar state:");
    console.log(this.state);
  }

  signout() {
    axios
      .get(`${server}/api/users/signout`, { withCredentials: true })
      .then((res) => {
        console.log(res);
        window.location = "/";
      })
      .catch((err) => console.log(err.message));
  }

  tweetPopUp() {}

  render() {
    return (
      <nav>
        <Link to={"/user/" + this.state.user.username}>
          <p style={{ fontSize: 20 }}>{this.state.user.username}</p>
        </Link>

        <p>
          <Link to="/homepage">
            <button className="btn btn-primary">Home Page</button>
          </Link>
        </p>

        <p>
          <Link to="/editprofile">
            <button className="btn btn-primary">Edit Profile</button>
          </Link>
        </p>

        <p>
          <button className="btn btn-primary" onClick={() => this.signout()}>
            Sign out
          </button>
        </p>
      </nav>
    );
  }
}
