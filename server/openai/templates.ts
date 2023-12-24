export function CHAIN_OF_DENSITY(article: string) {
    return `Article: ${article}

You will generate increasingly concise, entity-dense summaries of the above Article. Repeat the following 2 steps 5 times.

Step 1. Identify 1-3 informative Entities (";" delimited) from the Article which are missing from the previously generated summary.

Step 2. Write a new, denser summary of identical length which covers every entity and detail from the previous summary plus the Missing Entities.

A Missing Entity is:

Relevant: to the main story.
Specific: descriptive yet concise (5 words or fewer).
Novel: not in the previous summary.
Faithful: present in the Article.
Anywhere: located anywhere in the Article.
CoD Outputs (Added Details from previous)

Example of progressive summaries with added entities and details

Guidelines:

The first summary should be highly non-specific, containing little information beyond the entities marked as missing. Use overly verbose language and fillers (e.g., "this article discusses") to reach ~80 words.
Make every word count: re-write the previous summary to improve flow and make space for additional entities.
Make space with fusion, compression, and removal of uninformative phrases like "the article discusses".
The summaries should become highly dense and concise yet self-contained, e.g., easily understood without the Article.
Missing entities can appear anywhere in the new summary.
Never drop entities from the previous summary. If space cannot be made, add fewer new entities.
Remember, use the exact same number of words for each summary.

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
