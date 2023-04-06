<script>
    import UserList from "../widgets/UserList.svelte";
    import JoinForm from "../forms/JoinForm.svelte";

    import { onMount } from 'svelte';
    import io from 'socket.io-client';

    export let socket;

    onMount(() => {
        // Connect to the Socket.io endpoint on the backend
        socket = io('http://localhost:3000');
    });

    export let showForm = true;
    export function handleSubmit(e) {
        e.preventDefault();
        const name = e.target.elements.name.value;
        
        showForm = false;
        socket.emit('join-lobby', name);
    }
</script>

<div class="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    {#if showForm}
        <JoinForm handleSubmit={handleSubmit} />
    {:else}
        <UserList socket={socket} />
    {/if}
</div>