<script>
    import Navbar from "../generic/Navbar.svelte";
    import { Application, Text, Graphics } from 'svelte-pixi'
</script>

<div class="min-h-screen flex flex-col">
    <Navbar />
    <div class="flex mt-10 justify-center items-center">
        <Application width={400} height={400} antialias render="demand">
            <Text
            text="Hello World"
            anchor={0.5}
            x={200}
            y={200}
            style={{
                fill: 'white'
            }}
            />

            <Graphics
                x={200}
                y={200}
                draw={(graphics) => {
                    graphics.clear()
                    graphics.beginFill(0xde3249)
                    graphics.drawCircle(0, 0, 100)
                    graphics.endFill()
                }} />
        </Application>
    </div>
</div>
