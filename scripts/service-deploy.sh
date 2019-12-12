#!/bin/bash

if [[ "$1" == "master" ]]; then
	echo
	echo Deploying Senti Data Exporter $1 ...
	rsync -r --quiet $2/ deploy@rey.webhouse.net:/srv/nodejs/senti/services/data-exporter/production
	echo
	echo Restarting Senti Data Exporter service: $1 ...
	ssh deploy@rey.webhouse.net 'sudo /srv/nodejs/senti/services/data-exporter/production/scripts/service-restart.sh master'
	echo
	echo Deployment to Senti Data Exporter $1 and restart done!
	exit 0
fi

if [[ "$1" == "dev" ]]; then
	echo
	echo Deploying Senti Data Exporter Dev $1 ...
	rsync -r --quiet $2/ deploy@rey.webhouse.net:/srv/nodejs/senti/services/data-exporter/development
	echo
	echo Restarting Senti Data Exporter Dev service: $1 ...
	ssh deploy@rey.webhouse.net 'sudo /srv/nodejs/senti/services/data-exporter/development/scripts/service-restart.sh dev'
	echo
	echo Deployment to Senti Data Exporter Dev $1 and restart done!
	exit 0
fi