<script>
  import { Router, Route } from "svelte-routing";
  import Lobby from "./pages/Lobby.svelte";
  import Landing from "./pages/Landing.svelte";
  import Login from "./pages/Login.svelte";
  import Signup from "./pages/Signup.svelte";
  import Tag from "./games/Tag.svelte";
  import Mafia from "./games/Mafia.svelte";
  import About from "./pages/About.svelte";
  import Profile from "./pages/Profile.svelte";
  import Wackbox from "./games/Wackbox.svelte";
  import Draw from "./games/Draw.svelte";
  import Terms from "./forms/Terms.svelte";
</script>

<Router>
  <Route path="/" component={Landing} />
  <Route path="/login" component={Login} />
  <Route path="/signup" component={Signup} />
  <Route path="/lobby/*" component={Lobby} />
  <Route path="/about" component={About} />
  <Route path="/profile" component={Profile} />
  <Route package="/terms" component={Terms} />

  <!-- Game Routes -->
  <Route path="/game/tag/*" component={Tag} />
  <Route path="/game/mafia/*" component={Mafia} />
  <Route path="/game/wackbox/*" component={Wackbox} />
  <Route path="/game/draw%20something/*" component={Draw} />
</Router>
