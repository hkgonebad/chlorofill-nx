// Affiliate Link Utilities

// --- Amazon Affiliate Config ---
const AMAZON_AFFILIATE_TAG = "awzdigital00-21"; // Your Amazon affiliate tag
const AMAZON_BASE_URL = "https://www.amazon.in/s";

/**
 * Generates an Amazon search URL with the affiliate tag.
 * @param {string} searchTerm - The term to search for on Amazon.
 * @returns {string} The formatted Amazon search URL or '#' if searchTerm is empty.
 */
export const getAmazonSearchUrl = (searchTerm) => {
	if (!searchTerm || !searchTerm.trim()) return "#"; // Return a harmless link if search term is empty/whitespace
	const encodedSearchTerm = encodeURIComponent(searchTerm.trim());
	return `${AMAZON_BASE_URL}?k=${encodedSearchTerm}&tag=${AMAZON_AFFILIATE_TAG}`;
};
