.PHONY: all
all: build

.PHONY: build
build:
	hugo --minify

.PHONY: server
server:
	hugo server --minify --buildDrafts

.PHONY: clean
clean:
	rm -rf ./public/
	rm -rf ./resources/_gen/
