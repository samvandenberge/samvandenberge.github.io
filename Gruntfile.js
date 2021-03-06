module.exports = function (grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-uncss');
    grunt.loadNpmTasks('grunt-shell');

    var config = {

        pkg: grunt.file.readJSON('package.json'),

        jekyllConfig: grunt.file.readYAML('_config.yml'),

        project: {
            src: {
                css: 'src/css',
                js: 'src/js'
            },
            assets: {
                css: 'assets/<%= jekyllConfig.github_username %>-<%= jekyllConfig.version %>.css',
                js: 'assets/<%= jekyllConfig.github_username %>-<%= jekyllConfig.version %>.js'
            }
        },

        meta: {
            banner: '/*!\n' +
                ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                ' * <%= pkg.author %>\n' +
                ' * <%= pkg.description %>\n' +
                ' * <%= pkg.url %>\n' +
                ' * Copyright <%= pkg.copyright %>. <%= pkg.license %> licensed.\n' +
                ' */\n'
        },

        clean: ['assets'],

        copy: {
            font: {
                src: 'fonts/*',
                dest: 'assets',
                expand: true,
                cwd: 'bower_components/font-awesome'
            },
            images: {
                src: 'images/**/*',
                dest: 'assets',
                expand: true,
                cwd: 'src'
            },
            src: {
                src: 'favicon.ico',
                dest: './',
                expand: true,
                cwd: 'src'
            }
        },

        jshint: {
            files: ['<%= project.src.js %>/*.js', '!<%= project.src.js %>/linkedin.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        less: {
            build: {
                src: '<%= project.src.css %>/site.less',
                dest: '<%= project.assets.css %>'
            },
            dist: {
                src: ['<%= project.assets.css %>'],
                dest: '<%= project.assets.css %>',
                options: {
                    banner: '<%= meta.banner %>',
                    cleancss: true,
                    compress: true
                }
            }
        },

        /*
          ignore: do not remove code block highlight sytlesheet
        */
        uncss: {
            dist: {
                options: {
                    ignore: ['pre', 'code', 'pre code', /\.highlight(\s\.\w{1,3}(\s\.\w)?)?/, '.post img', '.post h4', 'aside section ul li span.disqus-author'],
                    media: ['(min-width: 768px)', '(min-width: 992px)', '(min-width: 1200px)'],
                    stylesheets: ['<%= project.assets.css %>'],
                    ignoreSheets: [/fonts.googleapis/],
                    report: 'min'
                },
                files: {
                    '<%= project.assets.css %>': ['_site/index.html', '_site/about/index.html']
                }
            }
        },

        shell: {
            jekyllBuild: {
                command: 'jekyll build'
            }
        },

        uglify: {
            options: {
                banner: "<%= meta.banner %>"
            },
            dist: {
                files: {
                    '<%= project.assets.js %>': '<%= project.assets.js %>'
                }
            }
        },

        watch: {
            files: [
                '_includes/*.html',
                '_docs/*.md',
                '_press/*.md',
                '_blog/*.md',
                '_layouts/*.html',
                '_posts/*.md',
                '_config.yml',
                'src/js/*.js',
                'index.html',
                'src/css/*.less',
                'about/*.html',
                'projects/*.html'
            ],
            tasks: ['build', 'shell:jekyllBuild'],
            options: {
                interrupt: true,
                atBegin: true
            }
        },

        delta: {
            jshint: {
                files: ['<%= project.src.js %>/**/*.js'],
                tasks: ['jshint', 'copy:js']
            },
            less: {
                files: ['<%= project.src.css %>/**/*.less'],
                tasks: ['less:build']
            }
        }
    };

    grunt.initConfig(config);

    grunt.registerTask('build', ['clean', 'jshint', 'copy', 'concatScripts', 'less:build']);
    grunt.registerTask('dist', ['build', 'less:dist', 'uglify', 'shell:jekyllBuild']);
    grunt.registerTask('default', ['watch']);

    grunt.registerTask('concatScripts', 'concat scripts based on jekyll configuration file _config.yml', function () {
        // concat task provides a process function to load dynamic scripts parameters
        var concat = {
            js: {
                dest: '<%= project.assets.js %>',
                options: {
                    process: function (content, srcPath) {
                        return grunt.template.process(content);
                    }
                }
            }
        },
          jekyllConfig = grunt.config.get('jekyllConfig'),
          scriptSrc = [];

        scriptSrc.push('<%= project.src.js %>/module.prefix');

        scriptSrc.push('<%= project.src.js %>/github.js');

        // only put scripts that will be used

        if (jekyllConfig.share.twitter) {
            scriptSrc.push('<%= project.src.js %>/twitter.js');
        }

        if (jekyllConfig.share.facebook) {
            scriptSrc.push('<%= project.src.js %>/facebook.js');
        }

        if (jekyllConfig.share.google_plus) {
            scriptSrc.push('<%= project.src.js %>/google-plus.js');
        }

        if (jekyllConfig.share.disqus) {
            scriptSrc.push('<%= project.src.js %>/disqus.js');
        }

        // include JQuery
        scriptSrc.push('bower_components/jquery/dist/jquery.js');
        scriptSrc.push('bower_components/jquery-validation/dist/jquery.validate.js');

        // include material.js
        scriptSrc.push('bower_components/bootstrap-material-design/dist/js/material.js');
        scriptSrc.push('bower_components/bootstrap-material-design/dist/js/ripples.js');

        // include scripts.js
        scriptSrc.push('<%= project.src.js %>/scripts.js');

        scriptSrc.push('<%= project.src.js %>/module.suffix');

        // explicitly put the linkedIn code out of the immediate function to work
        if (jekyllConfig.share.linkedin) {
            scriptSrc.push('<%= project.src.js %>/linkedin.js');
        }
        
        // set source
        concat.js.src = scriptSrc;

        // set a new task configuration
        grunt.config.set('concat', concat);

        // execute task
        grunt.task.run('concat');
    });
};
