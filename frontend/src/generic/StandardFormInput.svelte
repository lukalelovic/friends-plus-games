<script>
  export let label;
  export let inputVal;

  export let type;
  export let placeholder;

  const properties = {type, placeholder};
</script>

<div>
  <label class="text-gray-700 text-sm font-bold mb-2" for={label.toLowerCase().replaceAll(' ', '-')}>
    {label}
  </label>
  <input
    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    id={label.toLowerCase().replaceAll(' ', '-')}
    {...properties}
    bind:value={inputVal} />
</div>
