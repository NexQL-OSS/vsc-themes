.PHONY: all clean install build validate package package-dry-run watch debug open git-tag publish publish-vsx publish-ovsx site build-site help

# Variables
NODE_BIN := node
NPM_BIN := npm
VSCE_CMD := npx -y @vscode/vsce@2.24.0
OVSX_CMD := npx -y ovsx
VSCODE ?= code
SITE_PORT ?= 3000
SITE_DIR := site

EXTENSION_NAME := $(shell $(NODE_BIN) -p "require('./package.json').name")
EXTENSION_VERSION := $(shell $(NODE_BIN) -p "require('./package.json').version")
VSIX_FILE := $(EXTENSION_NAME)-$(EXTENSION_VERSION).vsix

# Default target
all: clean install build package

help:
	@printf '%s\n' \
		'Usage: make <target>' \
		'' \
		'Targets:' \
		'  all             Clean, install, build, and package' \
		'  clean           Remove build artifacts' \
		'  install         Install dependencies' \
		'  build           Generate + validate themes (pre-F5 / pre-package)' \
		'  validate        Run theme manifest validation' \
		'  package         Create a VS Code extension package (.vsix)' \
		'  package-dry-run Inspect the files that would be packaged' \
		'  publish         Publish .vsix to VS Code Marketplace and Open VSX' \
		'  publish-vsx     Publish .vsix to VS Code Marketplace only' \
		'  publish-ovsx    Publish .vsix to Open VSX Registry only' \
		'  watch           Re-run validation (no compile step for themes)' \
		'  debug           Launch Extension Development Host via CLI' \
		'  open            Open the workspace in VS Code' \
		'  git-tag         Interactive semver bump, commit, and push (CI publishes on upstream merge)' \
		'  site            Build the marketing site and preview it locally (SITE_PORT=$(SITE_PORT))' \
		'  build-site      Build the Astro marketing site into site/dist (installs site deps if needed)' \
		'' \
		'Development:' \
		'  Press F5 in VS Code ("Run Extension") to test without packaging.'

clean:
	rm -rf *.vsix node_modules

install:
	$(NPM_BIN) install

build:
	$(NPM_BIN) run compile

validate:
	$(NPM_BIN) run validate

package: build
	$(VSCE_CMD) package

package-dry-run:
	npm pack --dry-run

publish-vsx: package
	@echo "Publishing $(VSIX_FILE) to VS Code Marketplace..."
	test -f ./pat || (echo "Error: pat file not found. Create ./pat with your Marketplace PAT." && exit 1)
	$(VSCE_CMD) publish --packagePath $(VSIX_FILE) -p $(shell cat ./pat)
	@echo "Successfully published to VS Code Marketplace."

publish-ovsx: package
	@echo "Publishing $(VSIX_FILE) to Open VSX Registry..."
	test -f ./pat-open-vsx || (echo "Error: pat-open-vsx file not found. Create ./pat-open-vsx with your Open VSX token." && exit 1)
	$(OVSX_CMD) publish $(VSIX_FILE) -p $(shell cat ./pat-open-vsx)
	@echo "Successfully published to Open VSX Registry."

publish: publish-vsx publish-ovsx
	@echo "Successfully published $(VSIX_FILE) to both registries."

watch:
	$(NPM_BIN) run watch

debug:
	$(VSCODE) --new-window --extensionDevelopmentPath="$(PWD)" "$(PWD)"

open:
	$(VSCODE) --new-window "$(PWD)"

$(SITE_DIR)/node_modules: $(SITE_DIR)/package-lock.json
	$(NPM_BIN) --prefix $(SITE_DIR) ci
	@touch $@

build-site: $(SITE_DIR)/node_modules
	$(NPM_BIN) --prefix $(SITE_DIR) run build

site: build-site
	$(NPM_BIN) --prefix $(SITE_DIR) run preview -- --port $(SITE_PORT)

# Git tag and version bump (interactive)
git-tag:
	@echo "Current version: $(EXTENSION_VERSION)"
	@printf '%s\n' \
		'Release type:' \
		'  1) fix   — patch bump (e.g. 0.5.0 → 0.5.1)' \
		'  2) minor — minor bump (e.g. 0.5.0 → 0.6.0)' \
		'  3) major — major bump (e.g. 0.5.0 → 1.0.0)'; \
	read -p 'Choose [1-3]: ' CHOICE; \
	case "$$CHOICE" in \
		1|fix|patch) BUMP=patch ;; \
		2|minor) BUMP=minor ;; \
		3|major) BUMP=major ;; \
		*) echo "Invalid choice: $$CHOICE"; exit 1 ;; \
	esac; \
	VERSION=$$($(NODE_BIN) -e " \
		const bump = process.argv[1]; \
		const parts = process.argv[2].split('.').map((n) => Number(n)); \
		if (parts.length !== 3 || parts.some((n) => !Number.isInteger(n) || n < 0)) { \
			console.error('Invalid semver in package.json: ' + process.argv[2]); \
			process.exit(1); \
		} \
		let [major, minor, patch] = parts; \
		if (bump === 'patch') patch += 1; \
		else if (bump === 'minor') { minor += 1; patch = 0; } \
		else if (bump === 'major') { major += 1; minor = 0; patch = 0; } \
		else process.exit(1); \
		process.stdout.write([major, minor, patch].join('.')); \
	" "$$BUMP" "$(EXTENSION_VERSION)"); \
	echo "Next version: $$VERSION"; \
	read -p "Proceed with v$$VERSION? [y/N]: " CONFIRM; \
	case "$$CONFIRM" in \
		y|Y|yes|Yes) ;; \
		*) echo "Aborted."; exit 1 ;; \
	esac; \
	echo "Updating package.json version to $$VERSION..."; \
	$(NODE_BIN) -e "const pkg=require('./package.json'); pkg.version='$$VERSION'; require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');"; \
	echo "package.json updated."; \
	git add package.json; \
	git commit -m "Bump version to $$VERSION"; \
	git push origin HEAD; \
	echo "Version $$VERSION committed and pushed."; \
	echo "Merge to dev-asterix/main to publish (CI creates tag v$$VERSION on upstream)."
