<script>
    export let handleSubmit;
</script>

<div class="sm:mx-auto sm:w-full sm:max-w-md">
    <div class="text-center">
        <h2 class="text-4xl font-extrabold text-white">Join Lobby</h2>
    </div>
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form on:submit|preventDefault={handleSubmit}>
                <div class="mb-3">
                    <label
                        for="name-input"
                        class="block text-sm font-medium text-gray-700">
                        Name:
                    </label>
                    <div class="mt-1">
                        <input
                            type="text"
                            id="name-input"
                            name="name"
                            required
                            class="w-full py-2 px-4 rounded-md ring-2 ring-gradient-from-primary
                            ring-gradient-to-tertiary focus:outline-none"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600
                        hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Join Lobby
                </button>
            </form>
        </div>
    </div>
</div>
