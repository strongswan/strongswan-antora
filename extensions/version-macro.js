/**
 * Create a link to the changelog of a strongSwan version.
 *
 * Example:
 *
 * version:6.0.0[]
 *
 * The default link text is "version <version>", but may be customized:
 *
 * version:6.0.0[link text]
 * version:6.0.0["quoted with, comma"]
 */

'use strict'

const versionCompare = require('@antora/content-classifier/lib/util/version-compare-desc');

const inlineVersionMacro = (context, prefix) => {
	return function () {
		this.positionalAttributes(['linkText']);
		this.process((parent, target, attrs) => {
			const text = attrs.linkText || `${prefix} ${target}`;
			if (versionCompare(target, "5.9.2") > 0) {
				return text;
			}
			const url = `https://github.com/strongswan/strongswan/releases/tag/${target}`;
			return this.createInline(parent, 'anchor', text, {
				'type': 'link',
				'target': url
			});
		});
	}
}

module.exports.register = (registry, context) => {
	registry.inlineMacro('version', inlineVersionMacro(context, 'version'));
	registry.inlineMacro('Version', inlineVersionMacro(context, 'Version'));
};
