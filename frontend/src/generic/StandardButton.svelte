<script>
    export let clickEvent;
    export let value;
    export let filled;

    let className = "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";

    className += (filled) ? 'text-white bg-quaternary focus:ring-quaternary hover:bg-quaternary' : 'text-tertiary bg-white hover:bg-gray-200';
</script>

<button on:click={clickEvent} class={className}>
    {value}    
</button>