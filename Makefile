HUGO := ./run hugo
NPM := ./run npm

# CI installs exactly what the lockfile says; locally the lockfile may move.
NPM_INSTALL := $(if $(CI),ci,install)

.PHONY: all
all: build

.PHONY: dependencies
dependencies:
	$(NPM) $(NPM_INSTALL)

.PHONY: build
build: dependencies
	$(HUGO) --minify

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
