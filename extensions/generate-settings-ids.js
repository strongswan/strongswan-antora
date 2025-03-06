/**
 * Create anchors and links for tables that contain settings (e.g.
 * strongswan.conf or swanctl.conf).  It automatically adds the ID of the
 * most recent section to the ID in case of duplicates (e.g. for the secrets
 * sections).
 *
 * To enable this for a table, add the `has-settings` option.
 *
 * Example:
 *
 * == Section Title
 *
 * [%has-settings]
 * |===
 * |Key       |Default|Description|
 * |setting_a |       |           |
 * |setting_b |       |           |
 * |====
 *
 * This would e.g. generate an anchor with ID `_section_title_setting_a` in that
 * first cell, followed by an empty link right after it so it can be highlighted
 * in the HTML version.
 *
 * Subtitles inside the table (with header style and colspan) are also
 * supported:
 *
 * 3+h|sub.section|
 * |setting_c |       |           |
 *
 * This generates an ID of `_section_title_sub_section_setting_c`.
 */

'use strict'

// This is similar to what Asciidoctor uses for section IDs
const invalid_chars = /[^ \p{L}\p{M}\p{N}\p{Pc}\-.]+?/ug;
const separators = /[ _\-.]+?/g;
const multi_sep = /[_]{2,}/g;
const sep = '_';

const gen_id = (text) => {
	let id = text.toLowerCase().replace(invalid_chars, '');
	id = id.replace(separators, sep);
	return id.replace(multi_sep, sep);
};

const closest = (node, context) => {
	return node.context == context ? node : closest(node.parent, context);
};

module.exports.register = (registry, context) => {
	registry.treeProcessor(function () {
		this.process((doc) => {
			doc.findBy({ 'context': 'table' }, (table) => {
				return table.hasAttribute('has-settings-option');
			}).forEach((table) => {
				const section = closest(table.parent, 'section');
				const base_id = section ? section.id : '';
				let sub_id = '';
				table.rows.body.forEach((row) => {
					const first_cell = row[0];
					const text = first_cell.text;
					let id = `_${gen_id(text)}`;

					if (first_cell.getAttribute('style') == 'header' &&
						first_cell.getAttribute('width') > 0)
					{
						sub_id = id;
						id = '';
					}
					id = `${base_id}${sub_id}${id}`;

					let anchor = `[[${id}]]`;
					let link = `xref:#${id}[ ]`;
					row[0].text = `${anchor}${link}${text}`;
				});
			});
		});
	});
};
