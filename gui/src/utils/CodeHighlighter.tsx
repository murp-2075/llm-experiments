import { createSignal, onMount } from 'solid-js';

const CodeHighlighter = (props) => {
    const [processedContent, setProcessedContent] = createSignal('');
    let contentElRef;
    const processContent = () => {
        const regex = /```(\w+)?\n([\s\S]*?)```/g;
        const newContent = props.content.replace(regex, (match, lang, code) => {
            // Your processing logic here
            return `<pre><code class="language-${lang || 'plaintext'}">${code.trim()}</code></pre>`;
        });
        setProcessedContent(newContent);
    };

    onMount(() => {
        processContent();
        console.log("trying to highlight", props.content)
        setTimeout(() => Prism.highlightAllUnder(contentElRef), 1);
        // Prism.highlightAllUnder(contentElRef);
    });

    return (
        <div ref={contentElRef} innerHTML={processedContent()}></div>
    );
};

export default CodeHighlighter;