<script>
    import { Router, Route } from "svelte-routing";
    import Lobby from "./pages/Lobby.svelte";
</script>

<Router>
    <Route path="/" component={Lobby}/>
</Router>