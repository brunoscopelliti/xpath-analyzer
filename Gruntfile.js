module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.initConfig({

        concat: {
            app: {
                src: [
                    'src/app-manager.js',
                    'src/app-model.js',
                    'src/utils/simple-delegation.js',
                    'src/app.js'
                ],
                dest: 'dist/app.js',
            }
        },

        connect: {
            options: {
                base: './',
                hostname: '127.0.0.1',
                keepalive: true,
                open: true,
                protocol: 'http'
            },
            test: {
                options: {
                    port: 8081
                }
            }
        },

        copy: {
            appjs: {
                src: './dist/app.js',
                dest: './app/app.js'
            }
        },

        jshint: {
            options: {
                jshintrc: ".jshintrc",
                ignores: ['*.min.js']
            },
            all: ['./src/*.js']
        },

        browserify: {
            test: {
                files: {
                    'tests/bundle.js': ['tests/index.js']
                },
                options: {
                    debug: true
                }
            }
        },

        uglify: {
            options: {
                banner: '',
                sourceMap: false,
                preserveComments: 'some'
            },
            js: {
                files: [{
                    expand: true,
                    cwd: './dist',
                    src: ['*.js'],
                    dest: './dist',
                    ext: '.min.js'
                }]
            }
        },

        watch: {
            options: {
                livereload: 35729
            },
            js: {
                files: ['./src/*.js', './tests/*.js'],
                tasks: ['build', 'browserify:test']
            }
        }
    });

    grunt.registerTask('dev', ['watch:js']);
    grunt.registerTask('build', ['concat:app', /*'uglify:js', */ 'copy:appjs']);

    grunt.registerTask('test', ['build', 'browserify:test', 'connect:test']);

};