SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c # -c: Needed in .SHELLFLAGS. Default is -c.
.DEFAULT_GOAL := test

dotenv := $(PWD)/.env
-include $(dotenv)

export

npmi:
	@npm i
npmi-%:
	@npm i $(*)
npmi_if_needed:
	@if [[ ! -e node_modules ]]; then \
		make npmi; \
	fi

clean:
	@rm -rf node_modules

test:
	@node index.js $(test_url) "output/test_image.jpg"
	@test -s output/test_image.jpg
	@echo "==> ✓ test passed"

test-x:
	@npx --yes github:tro3373/pw_dl_img $(test_url) "output/test_image.jpg"
	@test -s output/test_image.jpg
	@echo "==> ✓ test passed"

install-g:
	@echo "==> Installing playwright.."
	@npm install -g playwright
	@echo "==> Installing pw_dl_img.."
	@npm install -g github:tro3373/pw_dl_img
