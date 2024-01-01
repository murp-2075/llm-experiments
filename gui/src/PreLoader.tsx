import { Show } from "solid-js";
import { appState } from "./Store";


const PreLoader = () => {
    return (
        <Show when={appState.fetchingCounter > 0}>
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </Show>
    )
}

export default PreLoader;