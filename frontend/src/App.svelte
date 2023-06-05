<script>
    import { Router, Route } from "svelte-routing";
    import Lobby from "./pages/Lobby.svelte";
    import Landing from "./pages/Landing.svelte";
    import Login from "./pages/Login.svelte";
    import Signup from "./pages/Signup.svelte";
    import Tag from "./games/Tag.svelte";
    import Mafia from "./games/mafia/Mafia.svelte";
    import About from "./pages/About.svelte";
    import Profile from "./pages/Profile.svelte";
</script>

<Router>
    <Route path="/" component={Landing} />
    <Route path="/login" component={Login} />
    <Route path="/signup" component={Signup} />
    <Route path="/lobby/*" component={Lobby} />
    <Route path="/about" component={About} />
    <Route path="/profile" component={Profile} />

    <!-- Game Routes -->
    <Route path="/game/tag/*" component={Tag}/>
    <Route path="/game/mafia/*" component={Mafia}/>
</Router>