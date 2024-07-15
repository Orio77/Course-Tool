// next.config.mjs
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        domains: ['lh3.googleusercontent.com', 's3.us-west-2.amazonaws.com'],
    },
    async headers() {
        return [
            {
                source: '/api/stripe',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-store',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
