import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Route, useParams } from "react-router-dom";
import Sidebar from "./components/sidebar.component";
import FrontPage from "./components/frontpage.component";
import HomePage from "./components/homepage.component";
import UserPage from "./components/userpage.component";
import EditProfile from "./components/editprofile.component";
import CreateProfile from "./components/createprofile.component";
import SignIn from "./components/signin.component";
import { getMyId } from "./util/util";
import { server } from "./util/env";
import "./App.css";
import axios from "axios";

const App = () => {
  return (
    <div>
      <TwitterClone />
    </div>
  );
};

/*Main component for project. Stores info for logged-in user to avoid a backend call for any change.*/

class TwitterClone extends Component {
  constructor(props) {
    super(props);
    let id = getMyId();
    this.state = {
      id: id,
      user: {
        username: "",
        id: 0,
        bio: "",
        join_date: new Date(),
        followers: [],
        following: [],
      },
      loaded: false,
    };
  }

  componentDidMount() {
    if (this.state.id) {
      axios
        .get(`${server}/api/users/current`, { withCredentials: true })
        .then((found) =>
          this.setState({
            user: {
              username: found.data.username,
              id: found.data._id,
              bio: found.data.bio,
              join_date: found.data.join_date,
              followers: found.data.followers,
              following: found.data.following,
            },
            loaded: true,
          })
        );
    } else {
      this.setState({ loaded: true });
    }
  }

  updateUser(updates) {
    let updated = this.state.user;
    Object.assign(updated, updates);
    this.setState({ user: updated });
  }

  sidebar() {
    return this.state.id != 0 && this.state.loaded ? (
      <div>
        <Sidebar id={this.state.id} user={this.state.user} />
      </div>
    ) : null;
  }

  render() {
    return (
      <div>
        <h1>Twitter 2</h1>
        <div className="d-flex">
          {this.state.loaded ? (
            <BrowserRouter>
              <div className="d-flex">{this.sidebar()}</div>
              <div className="d-flex">
                <Route path="/signup">
                  <CreateProfile updateuser={this.updateUser.bind(this)} />
                </Route>
                <Route path="/signin">
                  <SignIn updateuser={this.updateUser.bind(this)} />
                </Route>

                <Route path="/editprofile">
                  <EditProfile
                    user={this.state.user}
                    updateuser={this.updateUser.bind(this)}
                  />
                </Route>

                <Route path="/homepage">
                  <HomePage
                    user={this.state.user}
                    updateuser={this.updateUser.bind(this)}
                  />
                </Route>

                <Route path="/user/:username">
                  <UPage
                    me={this.state.user}
                    updateuser={this.updateUser.bind(this)}
                  />
                </Route>

                <Route exact path="/">
                  <FrontPage id={this.state.id} />
                </Route>
              </div>
            </BrowserRouter>
          ) : (
            <p>loading</p>
          )}
        </div>
      </div>
    );
  }
}

function UPage(props) {
  let name = useParams().username;
  console.log(name);
  return (
    <UserPage username={name} me={props.me} updateuser={props.updateuser} />
  );
}

export default App;
