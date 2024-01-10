import { exec } from 'child_process';

function combineAudioFiles(inputFiles, outputFile) {
    return new Promise((resolve, reject) => {
        if (inputFiles.length === 0) {
            reject(new Error('No input files'));
            return;
        }
        if (inputFiles.length === 1) {
            //copy the file to the output location
            exec(`mv ${inputFiles[0]} ${outputFile}`, (error, stdout, stderr) => {
                if (error) {
                    console.error('Error:', stderr);
                    reject(error);
                } else {
                    console.log('Output:', stdout);
                    resolve();
                }
            });
            return;
        }
        // Join the input files into a string separated by '|'
        const inputFilesString = inputFiles.join('|');

        // Construct the ffmpeg shell command
        console.log("inputFilesString", inputFilesString)
        const command = `ffmpeg -i "concat:${inputFilesString}" -acodec copy ${outputFile}`;

        // Execute the command
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Error:', stderr);
                reject(error);
            } else {
                console.log('Output:', stdout);
                resolve();
            }
        });
    });
}

export default combineAudioFiles;