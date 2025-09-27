import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noIndex?: boolean;
}

export const SEO = ({
  title = "AssetGuardian.ai - AI-Powered Asset Management Platform | Intelligent Asset Tracking",
  description = "Revolutionary AI-powered asset management platform. Predict failures, optimize performance, and reduce downtime with advanced machine learning. Enterprise-ready solution.",
  keywords = "AI asset management, artificial intelligence asset tracking, machine learning asset optimization, predictive maintenance, smart asset management",
  image = "/lovable-uploads/91b3768c-9bf7-4a1c-b2be-aea61a3ff3be.png",
  url = "https://assetguardian.ai",
  type = "website",
  noIndex = false
}: SEOProps) => {
  const fullTitle = title.includes('AssetGuardian.ai') ? title : `${title} | AssetGuardian.ai`;
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="AssetGuardian.ai" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <link rel="canonical" href={url} />
      <meta name="author" content="AssetGuardian.ai" />
      <meta name="theme-color" content="#1a1a1a" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "AssetGuardian.ai",
          "description": description,
          "url": url,
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "category": "Software"
          },
          "publisher": {
            "@type": "Organization",
            "name": "AssetGuardian.ai",
            "url": url,
            "logo": image
          }
        })}
      </script>
    </Helmet>
  );
};