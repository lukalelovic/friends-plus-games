<script>
    export let clickEvent;
    export let value;
</script>

<button on:click={clickEvent} class="w-full flex justify-center py-2 px-4 
    border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-quaternary 
    hover:bg-quaternary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-quaternary">

    {value}    
</button>