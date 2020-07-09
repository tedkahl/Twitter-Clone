import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import Timeline, { getNames, handleTimeline } from "./timeline.component";
import { findAndRemove, follow } from "../util/util";
import { limit, server } from "../util/env";

/*User page shows all tweets and retweets from a specific user, specified by the url. Includes a button to follow
or unfollow the user.*/
export default class UserPage extends Component {
  constructor(props) {
    super(props);
    console.log(this.props);

    this.state = {
      user: {
        username: "",
        id: props.id,
        bio: "",
        join_date: new Date(),
        followers: [],
        following: [],
      },
      loaded: false,
      limit: limit,
      timeline: [],
      tweets: [],
      names: {},
      me: props.me,
      updateuser: props.updateuser,
      failed: false,
    };
  }

  /*Get all necessary data (user, other users, tweets) and set state*/
  getUpage() {
    console.log(this.state);
    axios
      .get(
        `${server}/api/users/userpage/${this.props.username}/${this.state.limit}`
      )
      .then((found) => {
        found.data.other_users.push({
          _id: found.data.user._id,
          username: found.data.user.username,
        });
        let names = getNames(found.data.other_users);
        let tl = handleTimeline(
          this.state.me.id,
          found.data.user.tweets,
          found.data.tweets,
          0,
          this.state.limit
        );
        this.setState(
          {
            user: {
              username: found.data.user.username,
              id: found.data.user._id,
              bio: found.data.user.bio,
              join_date: found.data.user.join_date,
              followers: found.data.user.followers,
              following: found.data.user.following,
            },
            names: names,
            timeline: found.data.user.tweets,
            tweets: tl,
            loaded: true,
          },
          () => {
            console.log("Userpage state:");
            console.log(this.state);
          }
        );
      })
      .catch((err) => {
        console.log(err);
        this.setState({ failed: true });
      });
  }

  componentDidMount() {
    this.getUpage();
  }

  /*If user is changed update the page*/
  componentDidUpdate(prevProps) {
    if (this.props.username != prevProps.username) this.getUpage();
  }

  loadTimeline() {
    if (this.state.loaded)
      return (
        <Timeline
          timeline={this.state.timeline}
          tweets={this.state.tweets}
          names={this.state.names}
          userid={this.state.me.id}
          limit={this.state.limit}
        />
      );
    else if (this.state.failed) return <p>User not found</p>;
    else return <p>Loading...</p>;
  }

  followButton() {
    if (this.state.user.id == this.state.me.id) return null;
    if (this.state.user.followers.includes(this.state.me.id)) {
      return (
        <button
          className="btn btn-info"
          onClick={() => {
            follow(this.state.user.id, "unfollow").then(() => {
              let f = findAndRemove(
                this.state.me.following,
                this.state.user.id
              );
              this.state.updateuser({ following: f });

              let user = this.state.user;
              user.followers = findAndRemove(user.followers, this.state.me.id);

              this.setState({ user: user });
            });
          }}
        >
          Following
        </button>
      );
    } else
      return (
        <button
          className="btn btn-primary"
          onClick={() => {
            follow(this.state.user.id, "follow").then(() => {
              let f = this.state.me.following;
              f.push(this.state.user.id);
              this.state.updateuser({ following: f });

              let user = this.state.user;
              user.followers.push(this.state.me.id);
              this.setState({ user: user });
            });
          }}
        >
          Follow
        </button>
      );
  }

  render() {
    return (
      <div className="container">
        <div>
          <div className="d-flex">
            <h2 className="d-flex justify-content-start">
              {this.state.user.username}
            </h2>
            <div className="d-flex justify-content-end">
              {this.followButton()}
            </div>
          </div>
          <p>{this.state.user.bio}</p>
          <div className="row">
            <p className="col">
              Joined:{" "}
              {new Date(this.state.user.join_date).toDateString().slice(3)}
            </p>
            <p className="col">Followers: {this.state.user.followers.length}</p>
          </div>
        </div>
        <div>{this.loadTimeline()}</div>
      </div>
    );
  }
}
