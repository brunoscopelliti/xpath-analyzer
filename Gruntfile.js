module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: ''
			},
			app: {
				files: [{
					expand: true, 
					cwd: 'js/',
					src: ['*.js'], 
					dest: 'js/min/',
					ext: '.js'
				}]
			}
		}
	});

	// load plugins
	grunt.loadNpmTasks('grunt-contrib-uglify');

	// define default task(s).
	grunt.registerTask('default', ['uglify:app']);

};