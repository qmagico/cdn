#!/bin/bash

cd $(dirname $0) && cd ..  # Changing to project folder

lessc less/bootstrap.less src/plugins/web/static/css/qm.bootstrap.min.css
