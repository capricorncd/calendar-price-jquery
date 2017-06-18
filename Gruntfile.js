module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            build: {
                files: ['./src/calendar-price-jquery.js', './src/calendar-price-jquery.styl'],
                tasks: ['uglify', 'stylus'],
                options: {
                    spawn: false
                }
            }
        },
        uglify: {
            options: {
                banner: '/* <%= pkg.name %> | version: <%= pkg.version %> | author: <%= pkg.author %> | <%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            my_target: {
                files: {
                    './build/calendar-price-jquery.min.js': ['./src/calendar-price-jquery.js']
                }
            }
        },
        stylus: {
            compile: {
                options: {
                },
                files: {
                    './build/calendar-price-jquery.css': './src/calendar-price-jquery.styl' // 1:1 compile
                    // 'path/to/another.css': ['path/to/sources/*.styl', 'path/to/more/*.styl']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-stylus');

    grunt.registerTask('default', ['stylus', 'uglify', 'watch']);

}
