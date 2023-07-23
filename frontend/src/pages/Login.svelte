<script>
  import axios from "axios";
  import { PROD_URI } from "../config";
  import { navigate } from "svelte-routing";
  import UserForm from "../forms/UserForm.svelte";
  import StandardFormInput from "../generic/StandardFormInput.svelte";
    import FormButton from "../generic/FormButton.svelte";

  let username = "";
  let password = "";

  let errorText = "";

  async function handleSubmit() {
    errorText = "";

    try {
      const response = await axios.post(`${PROD_URI}/users/login`, {
        username: username,
        password: password,
      });

      console.log('Login success!');
      localStorage.setItem("token", response.data.token.token);
      navigate('/');
    } catch (error) {
      console.error(error);
      errorText = error.response.data.message;
    }
  }
</script>

<UserForm title="Login" handleSubmit={handleSubmit}>
  <StandardFormInput label="Username" bind:inputVal={username} placeholder="Enter your username" type="text" />
  <StandardFormInput label="Password" bind:inputVal={password} placeholder="Enter your password" type="password" />
  <div class="flex flex-col space-y-2">
    <a
      class="inline-block align-baseline font-bold text-quaternary hover:text-indigo-500"
      href="#"
    >
      Forgot Password?
    </a>
    <div class="text-gray-600">
      Don't have an account?
      <a class="font-bold text-secondary hover:text-tertiary" href="/signup"
        >Sign Up</a
      >
    </div>

    {#if errorText != ""}
      <h3 class="font-bold text-red-500 text-center">{errorText}</h3>
    {/if}

    <FormButton text="Log In" />
  </div>
</UserForm>