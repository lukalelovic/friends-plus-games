<script>
  import UserForm from "../forms/UserForm.svelte";
  import FormButton from "../generic/FormButton.svelte";
  import StandardFormInput from "../generic/StandardFormInput.svelte";

  let email = "";
  let errorText = "";

  async function handleSubmit() {
    errorText = "Forgot password under maintanence. Please try again later."
  }
</script>

<UserForm title="Forgot Password" handleSubmit={handleSubmit}>
  <StandardFormInput label="Email" inputVal={email} type="email" placeholder="Enter your email" />
  
  {#if errorText != ""}
    <h3 class="font-bold text-red-500 text-center">{errorText}</h3>
  {/if}

  <FormButton text="Submit" />
</UserForm>