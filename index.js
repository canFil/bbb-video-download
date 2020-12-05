const { ArgumentParser } = require('argparse')
const { version } = require('./package.json')
const { Processor } = require('./modules/processor')
const client_id = 'fb7697803f42ba95ad8473f86143c435f5222808';
const client_secret = 'F/4l/gaN4g6FI8HWrFVqa4OwUq5gHen0BTsE5Lo2fEF6W66HB1zr/iQCvK9RgO6tGcCDCv08eQVj95x6PQZmO4Tikul1k1J7SQamTrHW/RpuIXAlio/+LCdTm26cS1cM';
const access_token = '5394b25527d3c4dd6858294d4237798e';
var path = require('path');
let Vimeo = require('vimeo').Vimeo;
let client = new Vimeo(`${client_id}`, `${client_secret}`, `${access_token}`);

const argsParser = new ArgumentParser()
argsParser.add_argument('-v', '--version', {
    action: 'version', version
})
argsParser.add_argument('-i', '--input', {
    help: 'Path to published presentation',
    required: true
})

argsParser.add_argument('-o', '--output', {
    help: 'Outputfile .mp4',
    required: true
})

argsParser.add_argument('--slides-width', {
    help: 'Set width (int) of slide area (presentation and/or deskshare); default 1280',
    required: false,
    type: 'int',
    default: 1280
})

argsParser.add_argument('--webcams-width', {
    help: 'Set width (int) of webcams area; default 640',
    required: false,
    type: 'int',
    default: 640
})

argsParser.add_argument('--threads', {
    help: 'Set # of threads (int) to be used by ffmpeg; default 1',
    required: false,
    type: 'int',
    default: 1
})

argsParser.add_argument('--filter-threads', {
    help: 'Set # of filter threads (int) to be used by ffmpeg; default 1',
    required: false,
    type: 'int',
    default: 1
})


const args = argsParser.parse_args()

async function process(args) {
    try {
        const processor = new Processor(args)
        await processor.configure()
        await processor.createAssets()
        await processor.createVideo()
        await processor.cleanup()
        await processor.verify()
    } catch (error) {
        console.error(error)
        console.log(error)
    }

    try {
        uploadFile(args.output)
    } catch (error) {
        console.error(error)
        console.log(error)
    }
}

async function uploadFile(file_name) {
    client.upload(
        file_name,
        {
          'name': path.basename(file_name), //'Untitled',
          'description': path.basename(file_name) //'The description goes here.'
        },
        async function (uri) {
          console.log('Your video URI is: ' + uri);
        },
        function (bytes_uploaded, bytes_total) {
          var percentage = (bytes_uploaded / bytes_total * 100).toFixed(2)
          console.log(bytes_uploaded, bytes_total, percentage + '%')
        },
        function (error) {
          console.log('Failed because: ' + error)
        }
      )
} 

process(args)

