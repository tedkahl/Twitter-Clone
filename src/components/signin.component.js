import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { server } from "../util/env";

/*Displays sign-in form.*/
export default class SignIn extends Component {
  constructor(props) {
    super(props);
    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      username: "",
      password: "",
      updateuser: props.updateuser,
    };
  }

  onChangeUsername = (e) => {
    this.setState({
      username: e.target.value, //target is textbox on web page
    });
  };

  onChangePassword = (e) => {
    this.setState({
      password: e.target.value,
    });
  };

  onSubmit(e) {
    e.preventDefault();
    console.log(this.state);
    axios
      .post(`${server}/api/users/signin`, this.state, { withCredentials: true })
      .then((res) => {
        console.log(res.data.user);
        this.state.updateuser(res.data.user);
        window.location = "/homepage";
      })
      .catch((err) => {
        console.log(err.response);
      });
  }
  render() {
    return (
      <div>
        <h3>Sign In</h3>
        <form onSubmit={this.onSubmit}>
          <div className="form-group">
            <label>User name:</label>
            <input
              type="text"
              required
              className="form-control"
              onChange={this.onChangeUsername}
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              required
              className="form-control"
              onChange={this.onChangePassword}
            />
          </div>

          <div className="form-group">
            <input type="submit" value="Sign in" className="btn btn-primary" />
          </div>
        </form>
        <Link to="/">
          <button className="btn btn-info">Back</button>
        </Link>
      </div>
    );
  }
}
