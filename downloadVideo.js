
const readline = require('readline');
const fs = require('fs');
const cp = require('child_process');
const ytdl = require('ytdl-core');
const ffmpeg = require('ffmpeg-static');

const url = 'https://www.youtube.com/watch?v=qMxX-QOV9tI&list=RDGMEMQ1dJ7wXfLlqCjwV0xfSNbAVMqMxX-QOV9tI&start_radio=1';
const timeStart = '00:01:00';
const timeDuration = '00:00:25';
const output = `${__dirname}/CutVideo.mp4`;

const video = ytdl(url);

// Print download progress.
process.stdout.write('downloading video...');
video.on('progress', (chunkLength, downloaded, total) => {
    const percent = downloaded / total;
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`downloading video... ${(percent * 100).toFixed(2)}%`);
});

async function downloadVideo(){
    video.pipe(fs.createWriteStream(`${__dirname}/temp.mp4`)).on('finish',   () => {
        const ffmpegProcess = cp.spawn(ffmpeg, [
            '-y', '-v', 'error',
            '-progress', 'pipe:3',
            '-i', `${__dirname}/temp.mp4`,
            '-vcodec', 'copy', '-acodec', 'copy',
            '-ss', timeStart, '-t', timeDuration,
            '-f', 'matroska', 'pipe:4',
        ], {
            windowsHide: true,
            stdio: [
                'inherit', 'inherit', 'inherit',
                'pipe', 'pipe',
            ],
        });

        process.stdout.write('\n');
        ffmpegProcess.stdio[3].on('data', chunk => {
            readline.cursorTo(process.stdout, 0);
            const args = chunk.toString().trim().split('\n')
                .reduce((acc, line) => {
                    let parts = line.split('=');
                    acc[parts[0]] = parts[1];
                    return acc;
                }, {});
            process.stdout.write(`cutting video... ${args.progress}${' '.repeat(3)}`);
        });
        /*
        */ffmpegProcess.on('close', () => {
            process.stdout.write(`\nsaved to ${output}\n`);
            try {
                fs.unlinkSync(`${__dirname}/temp.mp4`)
                //file removed
            } catch(err) {
                console.error(err)
            }
        });

        ffmpegProcess.stdio[4].pipe(fs.createWriteStream(output));


    });




}
//delete  temp video
/*function deleteVideo(){
    try {
        fs.unlinkSync(`${__dirname}/temp.mp4`)
        //file removed
    } catch(err) {
        console.error(err)
    }
}*/

downloadVideo();





