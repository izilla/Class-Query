/*
 * Class Query v0.1.5
 *
 * Creates media queries from .classquery- classes for elements with data-classquery attributes
 *
 * Copyright (c) 2013 Matt Stow
 *
 * http://mattstow.com
 *
 * Licensed under the MIT license
*/
;(function() {
	
	function processRules(stylesheet, processor) {
		var rules = stylesheet.cssRules ? stylesheet.cssRules : stylesheet.media,
			rule,
			processed = [],
			length = rules.length;

		for (var i = 0; i < length; i++) {
			rule = rules[i];

			if (processor(rule))
				processed.push(rule);
		}

		return processed;
	}

	function getRules(stylesheet) {
		return processRules(stylesheet, function (rule) {
			if (!rule.selectorText) {
				return false;
			}
			else {
				if (rule.selectorText.indexOf('.classquery-') === 0) {
					return true;
				}
				else
					return false;
			}
		});
	}

	function sameOrigin(url) {
		var loc = window.location,
			a = doc.createElement('a');
		
		a.href = url;
		
		return a.hostname === loc.hostname && a.protocol === loc.protocol;
	}

	function isInline(stylesheet) {
		return stylesheet.ownerNode.constructor === HTMLStyleElement;
	}

	function isValidExternal(stylesheet) {
		return stylesheet.href && sameOrigin(stylesheet.href);
	}

	function getStylesheets() {
		var sheets = doc.styleSheets,
			sheet,
			length = sheets.length,
			i = 0,
			valid = [];
		
		for (i; i < length; i++) {
			sheet = sheets[i];
			if (isValidExternal(sheet) || isInline(sheet))
				valid.push(sheet);
		}

		return valid;
	}
	
	var doc = document,
		html = doc.documentElement,
		classQuery = 'classquery',
		$classQueries = doc.querySelectorAll('[data-' + classQuery + ']'),
		classQueriesLength = $classQueries.length;
		
	if (classQueriesLength === 0)
		return;
	
	var stylesheets = getStylesheets(),
		stylesheetsLength = stylesheets.length,
		rules;
	
	for (var i = 0; i < stylesheetsLength; i++) {
		rules = getRules(stylesheets[i]);
	}
	
	if (!rules || rules.length === 0)
		return;
	
	html.className += ' ' + classQuery + '-init';
	
	var classQueryId = classQuery + '-id',
		rulesLength = rules.length,
		$this,
		data,
		dataLength,
		currClass,
		currId,
		classes,
		classesLength,
		selector,
		selectorRX,
		dataSelector,
		before,
		after,
		style,
		css = '';
	
	for (var j = 0; j < classQueriesLength; j++) {
		$this = $classQueries[j];
		$this.setAttribute('data-' + classQueryId, j);
		data = $this.getAttribute('data-' + classQuery).split(';');
		dataLength = data.length;
		currClass = $this.getAttribute('class') ? '.' + $this.getAttribute('class').replace(/\s+/g, '.') : '';
		currId = $this.getAttribute('id') ? '#' + $this.getAttribute('id') : '';
		
		for (var k = 0; k < dataLength; k++) {
			classes = data[k].split(',');
			classesLength = classes.length;
			
			for (var l = 0; l < rulesLength; l++) {
				for (var m = 0; m < classesLength; m++) {
					classes[m] = classes[m].trim();
					
					if (m % 2 === 1 && rules[l].selectorText.match(classes[m])) {
						selector = 	rules[l].selectorText
									.replace(/\[/g, '\\[')
									.replace(/\]/g, '\\]')
									.replace(/\*/g, '\\*')
									.replace(/\^/g, '\\^')
									.replace(/\$/g, '\\$')
									+ ' +?{';
						
						selectorRX = new RegExp(selector, 'g');
						before = selector.match(/\:before/g) ? ':before' : '';
						after = selector.match(/\:after/g) ? ':after' : '';
						dataSelector = '[data-' + classQueryId + '="' + j + '"]' + currClass + currId + before + after;
						
						css += 	'@media ' + classes[m - 1] + '{' +
								dataSelector + ' {' +
								rules[l].cssText.replace(selectorRX, '') + '}\n';
					}
				}
			}
		}
	}
	
	style = doc.createElement('style');
	style.appendChild(doc.createTextNode(css));
	doc.head.appendChild(style);
	html.className = html.className.replace(classQuery + '-init', classQuery + '-complete');
})();