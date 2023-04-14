<script>
    let username = "";
    let email = "";
    let password = "";

    function handleSubmit() {
        // Handle login form submission
    }
</script>

<div class="flex flex-col h-screen justify-center items-center bg-gradient-to-t from-primary to-tertiary">
    <h1 class="text-4xl font-bold text-white mb-10">Games with Friends</h1>
    <form class="bg-white shadow-md rounded w-1/2 px-8 pt-6 pb-8 mb-4" on:submit|preventDefault={handleSubmit}>
        <h3 class="text-4xl text-center font-bold text-secondary mb-10">Sign Up</h3>
        
        <div class="mb-4">
            <label class="text-gray-700 text-sm font-bold mb-2" for="username">
                Username
            </label>
            <input
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="username"
                type="text"
                placeholder="Enter your username"
                bind:value={username} />
        </div>
        <div class="mb-4">
            <label class="text-gray-700 text-sm font-bold mb-2" for="username">
                Email
            </label>
            <input
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="username"
                type="email"
                placeholder="Enter your email"
                bind:value={email} />
        </div>
        <div class="mb-4">
            <label class="text-gray-700 text-sm font-bold mb-2" for="password">
                Password
            </label>
            <input
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                id="password"
                type="password"
                placeholder="Enter your password"
                bind:value={password} />
        </div>
        <div class="flex flex-col space-y-2">
            <a class="inline-block align-baseline font-bold text-quaternary hover:text-indigo-500" href="#">
                Forgot Password?
            </a>
            <div class="text-gray-600">
                Don't have an account?
                <a class="font-bold text-secondary hover:text-tertiary" href="/login">Login</a>
            </div>
            <button class="bg-secondary hover:bg-tertiary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-24" type="submit">
                Sign Up
            </button>
        </div>
    </form>
</div>
