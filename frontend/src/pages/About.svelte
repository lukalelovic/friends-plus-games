<script>

    import Navbar from "../generic/Navbar.svelte";

</script>
<div class="min-h-screen flex flex-col">
  <Navbar />

  <div class="flex flex-wrap justify-center items-center">
    <div class="flex flex-col items-center w-full sm:w-96">
      <img src="logo.svg" alt="logo" class="w-72 mt-16 mb-3 h-auto" />
  
      <div class="p-5 rounded-lg text-white font-bold">
        <p class="text-xl whitespace-normal mb-6">Friends + Games is a one-stop portal for playing browser-based, online games with your friends for completely free!</p>
        <p class="text-xl whitespace-normal mb-6">This is a solo development project by <a class="underline hover:text-gray-200" href="https://github.com/lukalelovic/">Luka</a>. 
          Please be patient for new updates.</p>
        <a href="/" class="p-3 bg-quaternary hover:bg-indigo-800 text-white font-bold w-fit rounded-md">Play Now!</a>
      </div>
    </div>

    <img src="mafia.png" alt="mafia" class="w-72 h-auto" />
  </div>
</div>