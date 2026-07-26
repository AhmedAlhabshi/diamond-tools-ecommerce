import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '6mb',
    },
  },

  allowedDevOrigins: ['192.168.0.148'],
};

export default withNextIntl(nextConfig);
