import { createSignal, onMount } from 'solid-js';

const CodeHighlighter = (props) => {
    const [processedContent, setProcessedContent] = createSignal('');
    let contentElRef;
    let debounceTimer;

    const debounce = (func, delay) => {
        return function(...args) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(this, args), delay);
        };
    };

    const processContent = () => {
        const regex = /```(\w+)?\n([\s\S]*?)```/g;
        const newContent = props.content.replace(regex, (match, lang, code) => {
            return `<pre><code class="language-${lang || 'plaintext'}">${code.trim()}</code></pre>`;
        });
        const splitContent = newContent.split(/(<pre>[\s\S]*?<\/pre>)/g);
        for (let i = 0; i < splitContent.length; i++) {
            if (!splitContent[i].startsWith('<pre>')) {
                splitContent[i] = splitContent[i].replace(/\n/g, '<br>');
            }
        }
        const brNewContent = splitContent.join('');
        setProcessedContent(brNewContent);

        // Debounce Prism highlighting
        debouncedHighlight();
    };

    const highlight = () => {
        Prism.highlightAllUnder(contentElRef);
    };

    const debouncedHighlight = debounce(highlight, 500); // 250ms debounce time for highlighting

    onMount(() => {
        processContent();
    });

    return (
        <div ref={contentElRef} innerHTML={processedContent()}></div>
    );
};

export default CodeHighlighter;
