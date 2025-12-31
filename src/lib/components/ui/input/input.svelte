<script>
    import { cn } from "$lib/utils.js";

    /** @type {string} */
    let className = "";
    export { className as class };

    /** @type {string} */
    export let type = "text";

    /** @type {string | undefined} */
    export let value = undefined;

    // Forward events
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    function handleInput(e) {
        value = e.target.value;
        dispatch("input", e);
    }
</script>

<input
    {type}
    class={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
    )}
    {value}
    on:input={handleInput}
    on:focus
    on:blur
    on:keydown
    on:keyup
    {...$$restProps}
/>
