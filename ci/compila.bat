#!/bin/bash

cd $(dirname $0) && cd ..  # Changing to project folder

rm static/css/qm.bootstrap.min.css static/css/qmagico.css 

lessc src/less/bootstrap.less static/css/qm.bootstrap.min.css
compass compile src/sass/