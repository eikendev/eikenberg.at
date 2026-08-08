ENGINE_COMMAND := ${shell . ./run; echo $$ENGINE_COMMAND}

HUGO := ./run hugo
NPM := ./run npm

.PHONY: all
all: build

.PHONY: dependencies
dependencies:
	$(NPM) install

.PHONY: build
build: dependencies
	$(HUGO) --minify
	# If we run using Docker, we should reset file ownership afterwards.
ifneq (,$(findstring docker,${ENGINE_COMMAND}))
	sudo chown -R ${shell id -u ${USER}}:${shell id -g ${USER}} ./public/
endif

.PHONY: server
server: dependencies
	$(HUGO) server --minify --buildDrafts

# Format templates (Go-template-aware), CSS and JS with Prettier.
.PHONY: format
format: dependencies
	$(NPM) run format

.PHONY: format-check
format-check: dependencies
	$(NPM) run format:check

.PHONY: validate-html
validate-html: build
	$(NPM) run test:html

.PHONY: audit
audit:
	$(NPM) audit --audit-level=high

.PHONY: test
test: format-check audit validate-html

.PHONY: clean
clean:
	rm -f .hugo_build.lock
	rm -rf ./node_modules/
	rm -rf ./public/
	rm -rf ./resources/_gen/
