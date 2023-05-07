<script>
  import axios from "axios";
  import { BACKEND_URI } from "../config";
  import { onMount } from "svelte";
  import { isLoggedIn } from "../stores";

  export let loggedIn = false;

  onMount(async () => {
    validateToken();
  });

  function search() {
    // TODO: Handle search functionality
  }

  async function validateToken() {
    const token = localStorage.getItem("token");

    if (!token) {
      loggedIn = false;
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URI}/users/validate`,
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
      loggedIn = false;
    } finally {
      isLoggedIn.set(loggedIn);
    }
  }
</script>

<nav class="bg-transparent border-b-2 border-secondary">
  <div class="container mx-auto px-4 py-2 flex justify-between items-center">
    <a href="/" class="text-white text-lg font-bold">
      <img class="w-64 m-0 p-1" src="/logo.svg" alt="Games with Friends" />
    </a>
    <div class="flex items-center">
      <div class="relative">
        <input
          type="text"
          class="bg-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:shadow-outline"
          placeholder="Search for Games..."
          on:input={search}
        />
        <div class="absolute right-0 top-0 mt-3 mr-4 text-gray-600">
          <!-- Search Icon -->
          <svg
            class="h-4 w-4"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M22 22l-6-6" />
            <path d="M10 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0 0v4" />
          </svg>
        </div>
      </div>

      {#if !loggedIn}
        <div class="ml-4">
          <a
            href="/login"
            class="bg-white hover:bg-gray-200 text-tertiary font-bold py-2 px-4 rounded"
          >
            Login
          </a>
        </div>
        <div class="ml-4">
          <a
            href="/signup"
            class="bg-quaternary hover:text-gray-200 text-white font-bold py-2 px-4 rounded"
          >
            Sign Up
          </a>
        </div>
      {:else}
        <a href="#" class="ml-4 text-white">Profile</a>
      {/if}
    </div>
  </div>
</nav>
