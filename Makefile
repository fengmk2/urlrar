TESTS = test/*.test.js
REPORTER = spec
TIMEOUT = 10000
JSCOVERAGE = ./node_modules/jscover/bin/jscover

install:
	@npm install

test:
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		$(TESTS)

test-cov: cov
	@URLRAR_COV=1 $(MAKE) -C .cov test
	@URLRAR_COV=1 $(MAKE) -C .cov test REPORTER=html-cov > coverage.html

cov:
	@rm -rf .cov
	@$(JSCOVERAGE) . .cov
	@cp -rf node_modules .cov

.PHONY: test-cov test cov
