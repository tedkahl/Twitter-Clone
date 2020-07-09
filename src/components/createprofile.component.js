import React, { Component } from "react";
import Select from "react-select";
import axios from "axios";
import { server } from "../util/env";

/*Displays a form for creating a new user profile. Data validation performed on the back end.*/
export default class CreateProfile extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onChangeFollowing = this.onChangeFollowing.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      username: "",
      password: "",
      repeat_password: "",
      bio: "",
      join_date: 0,
      following: [],
      follow_suggestions: [],
      updateuser: props.updateuser,
    };
  }

  /*retrieve popular users to suggest possible follows*/
  componentDidMount() {
    axios
      .get(`${server}/api/users/popular/5`)
      .then((response) => {
        if (response.data.length > 0) {
          this.setState({
            follow_suggestions: response.data.map((user) => {
              return { value: user._id, label: user.username };
            }),
          });
          console.log(this.state.follow_suggestions);
        }
      })
      .catch((err) => console.log(err.response));
  }

  onChange(event) {
    let name = event.target.name;
    let value = event.target.value;
    this.setState({ [name]: value });
  }

  onChangeFollowing = (selectedOption) => {
    let newfollowing = selectedOption
      ? selectedOption.map((option) => option.value)
      : null;
    this.setState(
      {
        following: newfollowing,
      },
      () => console.log(this.state.following)
    );
  };

  onSubmit(e) {
    e.preventDefault(); //prevent default form submission

    const user = {
      username: this.state.username,
      password: this.state.password,
      repeat_password: this.state.repeat_password,
      bio: this.state.bio,
      following: this.state.following,
      join_date: new Date().valueOf(),
    };

    console.log(user);
    axios
      .post(`${server}/api/users/`, user, { withCredentials: true })
      .then((res) => {
        console.log(res.data);
        this.state.updateuser(res.data.user);
        window.location = "/homepage";
      })
      .catch((err) => console.log(err.response));
  }
  render() {
    return (
      <div>
        <h3>Create Profile</h3>
        <form onSubmit={this.onSubmit}>
          <div className="form-group">
            <label>Choose a user name:</label>
            <input
              type="text"
              required
              name="username"
              onChange={this.onChange}
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              required
              name="password"
              onChange={this.onChange}
            />
          </div>
          <div className="form-group">
            <label>Confirm Password:</label>
            <input
              type="password"
              required
              name="repeat_password"
              onChange={this.onChange}
            />
          </div>
          <div className="form-group">
            <label>Describe yourself (optional):</label>
            <textarea
              style={{ height: 100 }}
              name="bio"
              onChange={this.onChange}
            />
          </div>
          <div className="form-group">
            <label>Choose some people to follow (optional):</label>
            <Select
              onChange={this.onChangeFollowing}
              options={this.state.follow_suggestions}
              isMulti={true}
            />
          </div>

          <div className="form-group">
            <input
              type="submit"
              value="Create Profile"
              className="btn btn-primary"
            />
          </div>
        </form>
      </div>
    );
  }
}
