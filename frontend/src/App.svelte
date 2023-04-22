<script>
    import { Router, Route } from "svelte-routing";
    import Lobby from "./pages/Lobby.svelte";
    import Landing from "./pages/Landing.svelte";
    import Login from "./pages/Login.svelte";
    import Signup from "./pages/Signup.svelte";
    import Tag from "./games/Tag.svelte";
</script>

<Router>
    <Route path="/" component={Landing}/>
    <Route path="/login" component={Login}/>
    <Route path="/signup" component={Signup}/>
    <Route path="/lobby" component={Lobby}/>
    <Route path="/game/tag" component={Tag}/>
</Router>