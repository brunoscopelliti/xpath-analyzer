module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({

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

        concat: {
            app: {
                src: [
                    'src/app-manager.js',
                    'src/utils/is-xml.js',
                    'src/utils/messanger.js',
                    'src/utils/simple-delegation.js',
                    'src/utils/simple-xhr.js',
                    'src/utils/loop-props.js',
                    'src/utils/filter-props.js',
                    'src/utils/xpath-parser.js',
                    'src/app-model.js',
                    'src/app-view.js',
                    'src/app.js'
                ],
                dest: 'dist/app.js',
            },
            applight: {
                src: [
                    'src/app-manager.js',
                    'src/utils/is-xml.js',
                    'src/utils/messanger.js',
                    'src/utils/simple-delegation.js',
                    'src/utils/simple-xhr.js',
                    'src/utils/loop-props.js',
                    'src/utils/filter-props.js',
                    'src/utils/xpath-parser.js',
                    'src/app-model.js',
                    'src/app-view.js'
                ],
                dest: 'dist/app-light.js',
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
            },
            logger: {
                src: './src/injected-scripts/logger.js',
                dest: './app/logger.js'
            }
        },

        jshint: {
            options: {
                jshintrc: ".jshintrc",
                ignores: ['*.min.js']
            },
            all: ['./src/*.js']
        },

        sass: {
            options: {
                style: 'compressed',
                sourcemap: 'none'
            },
            dist: {
                files: {
                    'app/main.css': 'style/main.scss'
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
            css: {
                files: ['style/main.scss', 'style/**/*.scss'],
                tasks: ['sass:dist']
            },
            js: {
                files: ['./src/*.js', './src/**/*.js', './tests/*.js', '!./tests/bundle.js'],
                tasks: ['build-test', 'browserify:test']
            },
            prod: {
                files: ['./src/*.js', './src/**/*.js'],
                tasks: ['build-prod']
            }
        }
    });

    grunt.registerTask('dev', ['watch:js']);
    grunt.registerTask('build-test', ['concat:applight']);
    grunt.registerTask('build-prod', ['concat:app', /*'uglify:js', */ 'copy']);

    grunt.registerTask('test', ['build-test', 'browserify:test', 'connect:test']);

};