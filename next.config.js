/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			new URL("https://gdbrowser.com/assets/**"),
		]
	}
};

module.exports = nextConfig;
