module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.initConfig({

        connect: {
            options: {
                hostname: '127.0.0.1',
                keepalive: true,
                open: true,
                protocol: 'http'
            },
            test: {
                options: {
                    base: './tests',
                    port: 8081
                }
            }
        },

        copy: {},

        jshint: {
            options: {
                jshintrc: ".jshintrc",
                ignores: ['*.min.js']
            },
            all: ['./src/index.js']
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
                    cwd: './src',
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
    grunt.registerTask('build', ['uglify:js']);

    grunt.registerTask('test', ['build', 'browserify:test', 'connect:test']);

};