import axios from "axios";
import { server } from "./env";

export function getMyId() {
  let index = document.cookie.indexOf("userid=");
  if (index == -1) return 0;
  else return document.cookie.substring(index + 7, index + 31);
}

export function convertDate(date) {
  let now = new Date();
  date = new Date(date);
  if (
    date.getDate() == now.getDate() &&
    date.getFullYear() == now.getFullYear()
  ) {
    let timesince = now - date;
    if (timesince < 3600000)
      return "" + Math.floor(timesince / 60000) + " minutes ago";
    else return "" + Math.floor(timesince / 3600000) + " hours ago";
  } else return date.toDateString().slice(3);
}

//operation is "like" or "unlike"
export function like(id, operation) {
  return new Promise((resolve, reject) => {
    axios
      .get(`${server}/api/tweets/${operation}/${id}`, { withCredentials: true })
      .then((res) => resolve(res))
      .catch((err) => reject(err));
  });
}

export function retweet(id) {
  return new Promise((resolve, reject) => {
    axios
      .get(`${server}/api/tweets/retweet/${id}`, { withCredentials: true })
      .then((res) => resolve(res))
      .catch((err) => reject(err));
  });
}

export function del(id) {
  return new Promise((resolve, reject) => {
    axios
      .get(`${server}/api/tweets/delete/${id}`, { withCredentials: true })
      .then((res) => resolve(res))
      .catch((err) => reject(err));
  });
}
export function unRetweet(id) {
  return new Promise((resolve, reject) => {
    axios
      .get(`${server}/api/tweets/unretweet/${id}`, { withCredentials: true })
      .then((res) => resolve(res))
      .catch((err) => reject(err));
  });
}
//operation is "follow" or "unfollow"
export function follow(id, operation) {
  return new Promise((resolve, reject) => {
    axios
      .get(`${server}/api/users/${operation}/${id}`, { withCredentials: true })
      .then((res) => resolve(res))
      .catch((err) => reject(err));
  });
}

//remove a specified value from an array without modifying it
export function findAndRemove(arr, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] == val) {
      return [...arr.slice(0, i), ...arr.slice(i + 1, arr.length)];
    }
  }
}
