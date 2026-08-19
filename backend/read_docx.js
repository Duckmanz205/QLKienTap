const mammoth = require('mammoth');
const path = process.argv[2];

if (!path) {
    console.error('Please provide a path');
    process.exit(1);
}

mammoth.extractRawText({path: path})
    .then(function(result){
        console.log(result.value);
    })
    .catch(function(err) {
        console.error(err);
    });
