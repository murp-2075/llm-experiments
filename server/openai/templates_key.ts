export function CHAIN_OF_DENSITY(article: string) {
    return `Article: ${article}

    You will generate increasingly concise, entity-dense summaries of the above Article, incorporating key phrases directly quoted from the text. Repeat the following steps 5 times:

    Step 1. Identify 1-3 informative Entities and 1-2 Critical Phrases (';' delimited) from the Article which are missing from the previously generated summary. Entities should be relevant, specific, novel, and faithful to the main story. Critical Phrases should be memorable or significant phrases directly quoted from the Article.
  
    Step 2. Write a new, denser summary of identical length which covers every entity, detail, and Critical Phrase from the previous summary plus the Missing Entities and Phrases. The summary should be highly dense and concise yet self-contained, easily understood without the Article.
  
    Guidelines:
    - The first summary should contain minimal specific information, using verbose language to reach ~80 words.
    - Each summary should progressively integrate more entities and critical phrases while maintaining the same word count.
    - Improve the flow and conciseness of each summary by fusing, compressing, and removing uninformative phrases.
    - Missing entities and critical phrases can be included anywhere in the new summary.
    - Never drop entities or critical phrases from previous summaries. If space is limited, prioritize integration.
    - Use the exact same number of words for each summary.
  
    Answer in JSON. The JSON should be a list (length 5) of dictionaries whose keys are 'Missing_Entities', 'Critical_Phrases', and 'Denser_Summary'.`}

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
