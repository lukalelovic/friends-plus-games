<script>
  import axios from "axios";
  import { PROD_URI } from "../config";
  import { navigate } from "svelte-routing";
  import UserForm from "../forms/UserForm.svelte";
    import StandardFormInput from "../generic/StandardFormInput.svelte";
    import FormButton from "../generic/FormButton.svelte";
    import Terms from "../forms/Terms.svelte";

  let username = "";
  let email = "";
  let password = "";
  let confirmPassword = "";

  let errorText = "";

  async function handleSubmit() {
    if (username == "" || password == "" || email == "") {
      errorText = "Empty fields exist."
      return;
    }

    if (password !== confirmPassword) {
      errorText = "Passwords do not match."
      return;
    };

    errorText = "";

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
      errorText = error.response.data.message;
    }
  }
</script>

<UserForm title="Sign Up" handleSubmit={handleSubmit}>
  <StandardFormInput label="Username" bind:inputVal={username} type="text" placeholder="Enter your username" />
  <StandardFormInput label="Email" bind:inputVal={email} type="email" placeholder="Enter your email" />
  <StandardFormInput label="Password" bind:inputVal={password} type="password" placeholder="Enter your password" />
  <StandardFormInput label="Confirm Password" bind:inputVal={confirmPassword} type="password" placeholder="Re-enter password" />

  <div class="flex flex-col space-y-2">
    <div class="text-gray-600">
      Already have an account?
      <a class="font-bold text-secondary hover:text-tertiary" href="/login">Login</a>
      <p class="mt-2">
        By continuing you agree to the
        <a href="/terms" class="inline-block align-baseline font-bold text-quaternary hover:text-indigo-500">
          Terms of Service
        </a>
      </p>
    </div>

    {#if errorText != ""}
      <h3 class="font-bold text-red-500 text-center">{errorText}</h3>
    {/if}

    <FormButton text="Sign Up" />
  </div>
</UserForm>