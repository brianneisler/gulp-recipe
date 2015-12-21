var npm = require('npm');

npm.load(function(err, npm) {
    npm.commands.ls([], true, function(err, data, lite) {
        console.log(data); //or lite for simplified output
    });
});
