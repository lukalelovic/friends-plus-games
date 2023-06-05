<script>
  import { onMount } from "svelte";
  import { getMe } from "../auth";
  import md5 from 'crypto-js/md5';

  let user = null;

  let isMobileMenuOpen = false;
  let isProfileMenuOpen = false;

  onMount(async () => {
    user = await getMe();
  });

  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
  }

  function toggleProfileMenu() {
    isProfileMenuOpen = !isProfileMenuOpen;
  }

  function logOut() {
    localStorage.removeItem("token");
    window.location.reload();
  }

  function generateGravatar() {
    return `https://www.gravatar.com/avatar/${md5(user.email)}?d=identicon&s=100`;
  }
</script>

<nav class="bg-transparent shadow-lg">
  <div class="container mx-auto px-4 py-2 flex justify-between items-center">
    <a href="/" class="text-white text-lg font-bold">
      <img class="w-72 m-0 p-1" src="/logo.svg" alt="Games with Friends" />
    </a>

    <div class="hidden lg:flex items-center">
      <a href="/about" class="text-white hover:text-gray-200 p-2">About</a>

      {#if !user}
        <div class="ml-4">
          <a
            href="/login"
            class="bg-white hover:bg-gray-200 text-tertiary font-bold py-2 px-4 rounded"
          >
            Login
          </a>
        </div>
        <div class="ml-4 whitespace-nowrap">
          <a
            href="/signup"
            class="bg-quaternary hover:text-gray-200 text-white font-bold py-2 px-4 rounded"
          >
            Sign Up
          </a>
        </div>
      {:else}
        <div class="relative flex flex-col px-6">
          <button on:click={toggleProfileMenu} class="flex flex-row space-x-2 rounded-md px-3 py-1 items-center border border-white hover:brightness-75">
            
            <img
              src={generateGravatar()}
              alt="User"
              class="w-10 h-10 rounded-full"
            />
            <h3 class="text-white text-lg">▾</h3>
          </button>

          {#if isProfileMenuOpen}
            <dialog
              class="absolute z-50 left-0 w-full top-full text-left text-white rounded-lg space-y-3 bg-tertiary shadow-lg"
              open={isProfileMenuOpen}
            >
              <a class="hover:text-gray-300" href="/profile">Profile</a>
              <button class="hover:text-gray-300 whitespace-nowrap" on:click={logOut}
                >Log Out</button
              >
            </dialog>
          {/if}
        </div>
      {/if}
    </div>

    <button
      class="lg:hidden text-white focus:outline-none"
      on:click={toggleMobileMenu}
    >
      <svg
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  </div>

  {#if isMobileMenuOpen}
    {#if !user}
      <div
        class="bg-transparent mt-2 py-3 px-4 shadow-lg rounded-md lg:hidden text-center space-y-2"
      >
        <a
          href="/login"
          class="block py-2 px-4 bg-white text-tertiary rounded-sm font-bold"
          >Login</a
        >
        <a
          href="/signup"
          class="block py-2 px-4 bg-quaternary text-white rounded-sm font-bold"
          >Sign Up</a
        >
      </div>
    {:else}
      <div
        class="bg-transparent mt-2 py-3 px-4 shadow-lg rounded-md lg:hidden text-center space-y-2"
      >
        <a
          href="/profile"
          class="block py-2 px-4 bg-white text-tertiary rounded-sm font-bold"
          >Profile</a
        >
        <button
          on:click={logOut}
          class="block py-2 px-4 bg-white min-w-full text-tertiary rounded-sm font-bold"
          >Logout</button
        >
      </div>
    {/if}
  {/if}
</nav>
