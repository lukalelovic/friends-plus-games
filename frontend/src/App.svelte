<script>
    import { Router, Route } from "svelte-routing";
    import Lobby from "./pages/Lobby.svelte";
    import Landing from "./pages/Landing.svelte";
    import Login from "./pages/Login.svelte";
    import Signup from "./pages/Signup.svelte";
    import Game from "./pages/Game.svelte";
</script>

<Router>
    <Route path="/" component={Landing}/>
    <Route path="/login" component={Login}/>
    <Route path="/signup" component={Signup}/>
    <Route path="/lobby" component={Lobby}/>
    <Route path="/game" component={Game}/>
</Router>