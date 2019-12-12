#!/bin/bash
# chmod 700 api-restart.sh

if [[ "$1" == "master" ]]; then
	npm install --prefix /srv/nodejs/senti/services/data-exporter/production
	systemctl restart senti-data-exporter.service
	# Senti Slack Workspace
	curl -X POST -H 'Content-type: application/json' --data '{"text":"Senti Data Exporter MASTER updated and restarted!"}' https://hooks.slack.com/services/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
	echo
	exit 0
fi

if [[ "$1" == "dev" ]]; then
	npm install --prefix /srv/nodejs/senti/services/data-exporter/development
	systemctl restart senti-data-exporter-dev.service
	# Senti Slack Workspace
	curl -X POST -H 'Content-type: application/json' --data '{"text":"Senti Data Exporter DEV updated and restarted!"}' https://hooks.slack.com/services/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
	echo
	exit 0
fi

exit 0


