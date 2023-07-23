<script>
  export let handleSubmit;
  export let title;
</script>

<div
  class="flex flex-col h-screen justify-center items-center bg-gradient-to-t from-primary to-tertiary p-1"
>
  <img class="w-96 m-0 p-1" src="/logo.svg" alt="Games with Friends" />
  <form
    class="bg-white w-full sm:w-1/2 shadow-md rounded px-8 pt-6 pb-8 mb-4"
    on:submit|preventDefault={handleSubmit}
  >
  <h3 class="text-4xl text-center font-bold text-secondary mb-10">{title}</h3>

  <div class="space-y-4">
    <slot></slot>
  </div>
  </form>
</div>