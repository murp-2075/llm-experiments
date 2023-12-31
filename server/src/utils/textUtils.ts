


function chunkText(text: string, maxChunkSize: number, delimiters: string[] = ['\n\n\n', '\n\n', '\n', '. ', ',', '.', ' ', '']) {
    // Start with the entire text as a single chunk
    const chunks = [text];

    delimiters.forEach((delimiter: string) => {
        // For each delimiter, split each chunk on that delimiter and replace the chunk with the split chunks
        chunks.forEach((chunk, index) => {
            if (chunk.length > maxChunkSize) {
                const splitChunks = chunk.split(delimiter);
                //Append the delimiter to each chunk except the last one
                splitChunks.forEach((splitChunk, splitIndex) => {
                    if (splitIndex < splitChunks.length - 1) {
                        splitChunks[splitIndex] = splitChunk + delimiter;
                    }
                })
                chunks.splice(index, 1, ...splitChunks);
            }
        })
    })
    //Now recomine chunks that are too small but make sure they're still smaller than maxChunkSize
    const combinedChunks = [];
    let currentChunk = '';
    for (const chunk of chunks) {
        if (currentChunk.length + chunk.length < maxChunkSize) {
            currentChunk += chunk;
        } else {
            combinedChunks.push(currentChunk);
            currentChunk = chunk;
        }
    }
    combinedChunks.push(currentChunk);

    //Add the last chunk
    return combinedChunks;
}

export { chunkText }