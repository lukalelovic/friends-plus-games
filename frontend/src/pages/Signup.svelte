<script>
  import axios from "axios";
  import { PROD_URI } from "../config";
  import { navigate } from "svelte-routing";

  let username = "";
  let email = "";
  let password = "";
  let confirmPassword = "";

  async function handleSubmit() {
    if (password !== confirmPassword) return;

    try {
      const response = await axios.post(`${PROD_URI}/users/signup`, {
        username: username,
        email: email,
        password: password,
      });

      console.log('Account successfully created!');
      localStorage.setItem("token", response.data.token.token);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  }
</script>

<div
  class="flex flex-col h-screen justify-center items-center bg-gradient-to-t from-primary to-tertiary"
>
  <img class="w-96 m-0 p-1" src="/logo.svg" alt="Games with Friends" />
  <form
    class="bg-white shadow-md rounded w-1/2 px-8 pt-6 pb-8 mb-4"
    on:submit|preventDefault={handleSubmit}
  >
    <h3 class="text-4xl text-center font-bold text-secondary mb-10">Sign Up</h3>

    <div class="mb-4">
      <label class="text-gray-700 text-sm font-bold mb-2" for="username">
        Username
      </label>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        id="username"
        type="text"
        placeholder="Enter your username"
        bind:value={username}
      />
    </div>
    <div class="mb-4">
      <label class="text-gray-700 text-sm font-bold mb-2" for="username">
        Email
      </label>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        id="email"
        type="email"
        placeholder="Enter your email"
        bind:value={email}
      />
    </div>
    <div class="mb-4">
      <label class="text-gray-700 text-sm font-bold mb-2" for="password">
        Password
      </label>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
        id="password"
        type="password"
        placeholder="Enter your password"
        minlength="7"
        bind:value={password}
      />
    </div>
    <div class="mb-4">
      <label class="text-gray-700 text-sm font-bold mb-2" for="password">
        Confirm Password
      </label>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
        id="password2"
        type="password"
        placeholder="Re-enter password"
        bind:value={confirmPassword}
      />
    </div>
    <div class="flex flex-col space-y-2">
      <a
        class="inline-block align-baseline font-bold text-quaternary hover:text-indigo-500"
        href="#"
      >
        Forgot Password?
      </a>
      <div class="text-gray-600">
        Don't have an account?
        <a class="font-bold text-secondary hover:text-tertiary" href="/login"
          >Login</a
        >
      </div>
      <button
        class="bg-secondary hover:bg-tertiary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-24"
        type="submit"
      >
        Sign Up
      </button>
    </div>
  </form>
</div>
