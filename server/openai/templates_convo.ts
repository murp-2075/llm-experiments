export function CHAIN_OF_DENSITY(article: string, conversation: boolean) {
    return `Article/Conversation: ${article}

This process generates increasingly concise, entity-dense summaries, with a special focus on preserving the conversational context if applicable. Repeat the following steps 5 times:

Step 1. Identify 1-3 informative Entities (";" delimited) from the Article/Conversation which are missing from the previously generated summary. In case of a conversation, entities should include key speakers and their main points.

Step 2. Write a new, denser summary of identical length which covers every entity and detail from the previous summary plus the Missing Entities. Ensure that the summary maintains the conversational context by specifying who said what, especially for direct quotes or key arguments.

A Missing Entity is:
- Relevant: to the main story or the core of the conversation.
- Specific: descriptive yet concise (5 words or fewer).
- Novel: not in the previous summary.
- Faithful: present in the Article/Conversation.
- Anywhere: located anywhere in the Article/Conversation.

CoD Outputs (Added Details from previous)

Example of progressive summaries with added entities and details, maintaining conversational context

Guidelines:
- The first summary should be broad, including little information beyond the entities marked as missing, but should outline the conversation structure (who is conversing and the general topic).
- Use precise language to convey who said what in the conversation.
- Make space in the summary through fusion, compression, and removal of uninformative phrases, while keeping conversational markers.
- The summaries should become highly dense and concise yet self-contained, e.g., easily understood without the Article/Conversation.
- Missing entities can appear anywhere in the new summary.
- Never drop entities or conversational context from the previous summary. If space cannot be made, add fewer new entities.
- Use the exact same number of words for each summary.

Answer in JSON. The JSON should be a list (length 5) of dictionaries whose keys are "Missing_Entities" and "Denser_Summary".`
}

export function EVALUATION_OF_SUMMARY(article: string, summary: string) {
    return `Article: ${article}
    
Summary: ${summary}

Please rate the summary from 1 (worst) to 5 (best) with respect to the following dimensions:

1. Informative: An informative summary captures the important information in the article and presents it accurately and concisely.
2. Quality: A high-quality summary is comprehensible and understandable.
3. Coherence: A coherent summary is well-structured and well-organized.
4. Attributable: Is all the information in the summary fully attributable to the Article?
5. Overall Preference: A good summary should convey the main ideas in the Article in a concise, logical, and coherent fashion.`
}
