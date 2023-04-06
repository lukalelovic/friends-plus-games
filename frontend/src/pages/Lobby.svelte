<script>
    import UserList from "../widgets/UserList.svelte";
    import JoinForm from "../forms/JoinForm.svelte";

    import { io } from 'socket.io-client';

    export const socket = io('http://localhost:8080'); // TODO: replace with URL to backend (environment variable)
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