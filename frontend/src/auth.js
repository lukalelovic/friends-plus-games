import axios from "axios";
import { PROD_URI } from "./config";

export async function validateToken() {
  let loggedIn = false;
  const token = localStorage.getItem("token");

  if (!token) {
    return false;
  }
  
  try {
    const response = await axios.post(
      `${PROD_URI}/users/validate`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    loggedIn = response.data.isValid;
  } catch (error) {
    console.log(error);
    localStorage.removeItem("token");
    return false;
  }

  return loggedIn;
}

export async function getMe() {
  const token = localStorage.getItem("token");
  let user = null;

  if (!token) {
    return null;
  }

  try {
    const response = await axios.get(
      `${PROD_URI}/users/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    user = response.data;
  } catch (error) {
    console.log(error);
    return null;
  }

  return user;
}